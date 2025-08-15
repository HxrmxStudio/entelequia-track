require "rails_helper"

RSpec.describe "Couriers", type: :request do
  let!(:user) { User.create!(email: "ops5@example.com", password_digest: "x", role: "ops", name: "Ops") }
  let(:auth) { auth_header_for(user) }

  it "creates and lists couriers with extended fields" do
    post "/couriers", params: { courier: { name: "Ana Rider", email: "ana@example.com", phone: "+5491112345678", active: true, vehicle: "bike", notes: "Prefers short routes" } }, headers: auth
    expect(response).to have_http_status(:created)
    body = JSON.parse(response.body)
    expect(body["email"]).to eq("ana@example.com")
    expect(body["phone"]).to include("+549")
    expect(body["vehicle"]).to eq("bike")
    expect(body["notes"]).to include("Prefers")

    get "/couriers", headers: auth
    expect(response).to have_http_status(:ok)
    list = JSON.parse(response.body)
    expect(list.any? { |c| c["email"] == "ana@example.com" && c["vehicle"] == "bike" }).to be(true)
  end
end


