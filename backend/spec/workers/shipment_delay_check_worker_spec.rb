require "rails_helper"

RSpec.describe ShipmentDelayCheckWorker, type: :worker do
  it "creates one open shipment_delayed alert when ETA passed and not delivered/canceled and sets payload" do
    ENV["SLA_ETA_DELAY_MIN"] = "1"
    order = Order.create!(external_ref: "X1", customer: Customer.create!(name: "C"), address: Address.create!(line1: "A", country: "AR"))
    eta_time = Time.current - 5.minutes
    shipment = Shipment.create!(order: order, status: "out_for_delivery", eta: eta_time)

    received = []
    token = RealtimeBus.subscribe { |p| received << p }
    described_class.new.perform
    RealtimeBus.unsubscribe(token)

    a = Alert.find_by(code: "shipment_delayed", shipment_id: shipment.id, status: :open)
    expect(a).to be_present
    expect(received.any? { |p| p[:type] == "alert.created" && p[:data][:type] == "shipment_delayed" }).to be(true)

    # Running again does not duplicate
    described_class.new.perform
    expect(Alert.where(code: "shipment_delayed", shipment_id: shipment.id, status: :open).count).to eq(1)

    # Assert payload rounding/eta presence
    expect(a.data["delay_min"]).to be_a(Integer)
    expect(a.data["delay_min"]).to be >= 5
    expect(a.data["eta"]).to eq(eta_time.iso8601)
  end
end


