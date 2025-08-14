class GpsOfflineCheckWorker
  include Sidekiq::Worker
  sidekiq_options queue: :monitoring, retry: 3

  def perform
    threshold_min = ENV.fetch("SLA_GPS_OFFLINE_MIN", "10").to_i
    threshold_sec = threshold_min * 60
    now = Time.current

    # Active couriers
    Courier.where(active: true).find_each do |courier|
      last_loc = Location.where(courier_id: courier.id).order(recorded_at: :desc).limit(1).first
      last_ts  = last_loc&.recorded_at
      next if last_ts && (now - last_ts < threshold_sec)

      # Create/refresh open alert
      mins = last_ts ? ((now - last_ts) / 60).floor : nil
      msg = last_ts ? "Courier #{courier.name} without GPS for #{mins} min" : "Courier #{courier.name} has never reported GPS"

      alert = Alert.upsert_touch!(
        code: "gps_offline",
        kind: "courier",
        severity: mins && mins >= threshold_min*2 ? "critical" : "warning",
        message: msg,
        courier: courier,
        data: { last_ping_at: last_ts&.iso8601, threshold_min: threshold_min }
      )

      publish_alert(alert)
    end
  end

  private

  def publish_alert(alert)
    RealtimeBus.publish("alert.created", serialize_alert(alert))
  end

  def serialize_alert(a)
    {
      id: a.id,
      type: a.code,
      status: a.status,
      resource: { type: "Courier", id: a.courier_id },
      payload: a.data,
      created_at: a.created_at&.iso8601,
      resolved_at: a.status == "resolved" ? (a.data["resolved_at"] || a.updated_at&.iso8601) : nil
    }
  end
end
