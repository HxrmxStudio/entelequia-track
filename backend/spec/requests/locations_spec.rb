require "rails_helper"

RSpec.describe "Locations", type: :request do
  let!(:user) { User.create!(email: "ops2@example.com", password_digest: "x", role: "ops", name: "Ops") }
  let(:auth) { auth_header_for(user) }

  it "accepts a ping and auto-resolves gps_offline" do
    courier = Courier.create!(code: "C200", name: "Auto Resolve")
    alert = Alert.create!(code: "gps_offline", kind: "courier", status: "open", severity: "warning", message: "m", courier: courier, first_detected_at: 30.minutes.ago, last_detected_at: 10.minutes.ago, data: {})

    received = []
    token = RealtimeBus.subscribe { |p| received << p }

    post "/locations", params: { courier_id: courier.id, ts: Time.current.iso8601, lat: 0, lon: 0 }, headers: auth

    RealtimeBus.unsubscribe(token)

    expect(response).to have_http_status(:created)
    expect(Alert.find(alert.id).status).to eq("resolved")
    expect(received.any? { |p| p[:type] == "alert.resolved" && p[:data][:id] == alert.id }).to be(true)
  end
end

require "rails_helper"

RSpec.describe "Locations", type: :request do
  let(:courier) { Courier.create!(code: "C1", name: "Juan") }

  it "accepts a ping" do
    # If this endpoint requires auth, include it; if not, the header is ignored
    admin = User.create!(email: "admin@x.com", password: "secret", role: "admin")
    post "/locations", headers: auth_header_for(admin), params: { courier_id: courier.id, ts: Time.current.iso8601, lat: -34.60, lon: -58.38 }
    expect([200,201]).to include(response.status)
  end
end
