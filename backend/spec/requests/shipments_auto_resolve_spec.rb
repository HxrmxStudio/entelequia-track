require "rails_helper"

RSpec.describe "Shipments auto-resolve", type: :request do
  let!(:user) { User.create!(email: "ops3@example.com", password_digest: "x", role: "ops", name: "Ops") }
  let(:auth) { auth_header_for(user) }

  it "resolves shipment_delayed when shipment updated to delivered" do
    order = Order.create!(external_ref: "U1", customer: Customer.create!(name: "C"), address: Address.create!(line1: "A", country: "AR"))
    s = Shipment.create!(order: order, status: "out_for_delivery", eta: 1.hour.ago)
    Alert.create!(code: "shipment_delayed", kind: "shipment", status: "open", severity: "warning", message: "m", shipment: s, first_detected_at: 1.hour.ago, last_detected_at: 10.minutes.ago, data: {})

    received = []
    token = RealtimeBus.subscribe { |p| received << p }
    patch "/shipments/#{s.id}", params: { status: "delivered" }, headers: auth
    RealtimeBus.unsubscribe(token)

    expect(response).to have_http_status(:ok)
    expect(Alert.where(code: "shipment_delayed", shipment_id: s.id, status: :open).count).to eq(0)
    expect(received.any? { |p| p[:type] == "alert.resolved" }).to be(true)
  end
end


