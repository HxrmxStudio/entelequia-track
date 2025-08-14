require "rails_helper"

RSpec.describe GpsOfflineCheckWorker, type: :worker do
  it "creates a single open alert per courier when offline beyond threshold" do
    ENV["SLA_GPS_OFFLINE_MIN"] = "5"
    courier = Courier.create!(code: "C100", name: "No GPS")
    # No locations at all -> should create alert
    received = []
    token = RealtimeBus.subscribe { |p| received << p }
    described_class.new.perform
    RealtimeBus.unsubscribe(token)

    alerts = Alert.where(code: "gps_offline", courier_id: courier.id)
    expect(alerts.count).to eq(1)
    expect(received.any? { |p| p[:type] == "alert.created" && p[:data][:type] == "gps_offline" }).to be(true)

    # Run again -> still one open alert
    described_class.new.perform
    expect(Alert.where(code: "gps_offline", courier_id: courier.id, status: :open).count).to eq(1)
  end

  it "does not create alert if recent location within threshold" do
    ENV["SLA_GPS_OFFLINE_MIN"] = "10"
    courier = Courier.create!(code: "C101", name: "Has GPS")
    Location.create!(courier_id: courier.id, recorded_at: 2.minutes.ago, geom: "POINT(0 0)")
    described_class.new.perform
    expect(Alert.where(code: "gps_offline", courier_id: courier.id).count).to eq(0)
  end
end


