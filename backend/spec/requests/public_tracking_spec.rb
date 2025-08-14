require "rails_helper"

RSpec.describe "Public tracking realtime", type: :request do
  let!(:user) { User.create!(email: "ops4@example.com", password_digest: "x", role: "ops", name: "Ops") }
  let(:auth) { auth_header_for(user) }

  it "broadcasts public.location on courier ping for active shipments" do
    courier = Courier.create!(code: "C900", name: "Pub Courier")
    order = Customer.create!(name: "C").then { |c| o = Order.create!(external_ref: "PX1", customer: c, address: Address.create!(line1: "A", country: "AR")); o }
    shipment = Shipment.create!(order: order, status: "out_for_delivery", assigned_courier_id: courier.id, qr_token: "PUB900")

    expect {
      post "/locations", params: { courier_id: courier.id, ts: Time.current.iso8601, lat: 1.23, lon: 4.56 }, headers: auth
    }.to have_broadcasted_to("public:track:PUB900").with(hash_including(type: "public.location", data: hash_including(code: "PUB900")))

    expect(response).to have_http_status(:created)
  end

  it "broadcasts public.shipment on shipments#update (status/eta)" do
    courier = Courier.create!(code: "C901", name: "Pub Courier 2")
    order = Customer.create!(name: "C2").then { |c| o = Order.create!(external_ref: "PX2", customer: c, address: Address.create!(line1: "B", country: "AR")); o }
    shipment = Shipment.create!(order: order, status: "out_for_delivery", assigned_courier_id: courier.id, qr_token: "PUB901")

    expect {
      patch "/shipments/#{shipment.id}", params: { status: "delivered" }, headers: auth
    }.to have_broadcasted_to("public:track:PUB901").with(hash_including(type: "public.shipment", data: hash_including(code: "PUB901", status: "delivered")))

    expect(response).to have_http_status(:ok)
  end

  it "does not broadcast public.location for delivered shipments" do
    courier = Courier.create!(code: "C902", name: "No Broadcast Delivered")
    order = Customer.create!(name: "C3").then { |c| Order.create!(external_ref: "PX3", customer: c, address: Address.create!(line1: "C", country: "AR")) }
    shipment = Shipment.create!(order: order, status: "delivered", assigned_courier_id: courier.id, qr_token: "PUB902")

    expect {
      post "/locations", params: { courier_id: courier.id, ts: Time.current.iso8601, lat: 1.0, lon: 2.0 }, headers: auth
    }.not_to have_broadcasted_to("public:track:PUB902")
  end

  it "does not broadcast public.location for canceled shipments" do
    courier = Courier.create!(code: "C903", name: "No Broadcast Canceled")
    order = Customer.create!(name: "C4").then { |c| Order.create!(external_ref: "PX4", customer: c, address: Address.create!(line1: "D", country: "AR")) }
    shipment = Shipment.create!(order: order, status: "canceled", assigned_courier_id: courier.id, qr_token: "PUB903")

    expect {
      post "/locations", params: { courier_id: courier.id, ts: Time.current.iso8601, lat: 3.0, lon: 4.0 }, headers: auth
    }.not_to have_broadcasted_to("public:track:PUB903")
  end

  it "broadcasts public.shipment on ETA-only change" do
    courier = Courier.create!(code: "C904", name: "ETA Only")
    order = Customer.create!(name: "C5").then { |c| Order.create!(external_ref: "PX5", customer: c, address: Address.create!(line1: "E", country: "AR")) }
    shipment = Shipment.create!(order: order, status: "out_for_delivery", assigned_courier_id: courier.id, qr_token: "PUB904", eta: Time.current + 30.minutes)
    new_eta = (Time.current + 45.minutes).iso8601

    expect {
      patch "/shipments/#{shipment.id}", params: { eta: new_eta }, headers: auth
    }.to have_broadcasted_to("public:track:PUB904").with(hash_including(type: "public.shipment", data: hash_including(code: "PUB904", eta: new_eta)))
  end
end


