class Alert < ApplicationRecord
  belongs_to :courier, optional: true
  belongs_to :shipment, optional: true
  belongs_to :route, optional: true

  enum :status, { open: "open", resolved: "resolved" }
  enum :severity, { info: "info", warning: "warning", critical: "critical" }

  validates :code, presence: true
  validates :kind, presence: true
  validates :message, presence: true
  validates :status, inclusion: { in: statuses.keys }
  validates :severity, inclusion: { in: severities.keys }

  scope :active, -> { where(status: :open) }
  scope :open, -> { where(status: :open) }
  scope :resolved, -> { where(status: :resolved) }
  scope :for_type, ->(code) { where(code: code) }
  scope :for_courier, ->(id) { where(courier_id: id) }
  scope :for_shipment, ->(id) { where(shipment_id: id) }

  def self.upsert_touch!(code:, kind:, message:, severity: "warning", courier: nil, shipment: nil, route: nil, data: {})
    now = Time.current
    rec = Alert.where(
      code: code, kind: kind, status: :open,
      courier_id: courier&.id, shipment_id: shipment&.id
    ).first
    if rec
      rec.update!(last_detected_at: now, data: rec.data.merge(data))
      rec
    else
      Alert.create!(
        code: code, kind: kind, message: message, severity: severity,
        courier: courier, shipment: shipment, route: route,
        first_detected_at: now, last_detected_at: now, data: data
      )
    end
  end

  def resolve!(note: nil)
    update!(status: :resolved, data: data.merge(resolution_note: note, resolved_at: Time.current))
  end
end