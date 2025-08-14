class ShipmentDelayCheckWorker
  include Sidekiq::Worker
  sidekiq_options queue: :monitoring, retry: 3

  def perform
    threshold_min = ENV.fetch("SLA_ETA_DELAY_MIN", "5").to_i
    now = Time.current

    # Not delivered/canceled and past ETA
    overdue = Shipment.where.not(status: [:delivered, :canceled])
                      .where.not(eta: nil)
                      .where("eta < ?", now - threshold_min.minutes)

    overdue.find_each do |sh|
      delay_min = ((now - sh.eta) / 60).floor
      msg = "Shipment #{sh.id} delayed #{delay_min} min (ETA #{sh.eta&.iso8601})"
      alert = Alert.upsert_touch!(
        code: "shipment_delayed",
        kind: "shipment",
        severity: delay_min >= threshold_min*4 ? "critical" : "warning",
        message: msg,
        shipment: sh,
        route: sh.stop&.route,
        courier: sh.assigned_courier,
        data: { eta: sh.eta&.iso8601, delay_min: delay_min, threshold_min: threshold_min }
      )
      publish_alert(alert)
    end
  end

  private

  def publish_alert(alert)
    RealtimeBus.publish("alert.created", serialize_alert(alert))
  end

  def serialize_alert(a)
    resource = if a.shipment_id
      { type: "Shipment", id: a.shipment_id }
    elsif a.route_id
      { type: "Route", id: a.route_id }
    else
      { type: "Unknown", id: nil }
    end
    {
      id: a.id,
      type: a.code,
      status: a.status,
      resource: resource,
      payload: a.data,
      created_at: a.created_at&.iso8601,
      resolved_at: a.status == "resolved" ? (a.data["resolved_at"] || a.updated_at&.iso8601) : nil
    }
  end
end
