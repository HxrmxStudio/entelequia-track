require "rails_helper"

RSpec.describe "Shipments", type: :request do
  let(:admin) { User.create!(email: "admin@x.com", password: "secret", role: "admin") }

  it "shows shipment with events and updates via PATCH" do
    order = Order.create!(external_ref: "O1", status: "received", amount_cents: 1000, currency: "ARS")
    shipment = Shipment.create!(order_id: order.id, status: "queued", delivery_method: "courier", qr_token: SecureRandom.uuid)
    Event.create!(type_key: "queued", subject_id: shipment.id, occurred_at: Time.current, payload: { note: "created" })

    get "/shipments/#{shipment.id}", headers: auth_header_for(admin)
    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body["events"]).to be_an(Array)
    expect(body["events"].first["type_key"]).to eq("queued")

    patch "/shipments/#{shipment.id}",
      headers: auth_header_for(admin),
      params: { status: "out_for_delivery" }

    expect(response).to have_http_status(:ok)
    updated = JSON.parse(response.body)
    expect(updated["status"]).to eq("out_for_delivery")
  end
end
