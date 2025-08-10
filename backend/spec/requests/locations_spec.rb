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
