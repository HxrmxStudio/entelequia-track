require "rails_helper"

RSpec.describe "Orders", type: :request do
  let(:admin) { User.create!(email: "admin@x.com", password: "secret", role: "admin") }

  it "lists orders" do
    Order.create!(external_ref: "A1", status: "received", amount_cents: 1000, currency: "ARS")
    get "/orders", headers: auth_header_for(admin)
    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body).to be_an(Array)
    expect(body.first["external_ref"]).to eq("A1")
  end

  it "creates and updates via PATCH" do
    post "/orders",
      headers: auth_header_for(admin),
      params: { external_ref: "B2", status: "received", amount_cents: 1500, currency: "ARS" }

    expect(response).to have_http_status(:created)
    created = JSON.parse(response.body)

    patch "/orders/#{created["id"]}",
      headers: auth_header_for(admin),
      params: { status: "ready_for_dispatch" }

    expect(response).to have_http_status(:ok)
    updated = JSON.parse(response.body)
    expect(updated["status"]).to eq("ready_for_dispatch")
  end
end
