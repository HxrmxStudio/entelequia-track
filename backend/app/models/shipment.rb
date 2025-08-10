class Shipment < ApplicationRecord
    belongs_to :order
    belongs_to :assigned_courier, class_name: "Courier", optional: true
    has_many :proofs, dependent: :destroy
    has_many :events, -> { order(occurred_at: :asc) }, primary_key: :id, foreign_key: :subject_id
    has_one :stop
  
    enum :status, {
      queued: "queued",
      out_for_delivery: "out_for_delivery",
      delivered: "delivered",
      failed: "failed",
      canceled: "canceled"
    }
  
    enum :delivery_method, {
      courier: "courier",
      pickup: "pickup",
      carrier: "carrier",
      other: "other"
    }
  
    validates :status, inclusion: { in: statuses.keys }
    validates :delivery_method, inclusion: { in: delivery_methods.keys }
  end
  