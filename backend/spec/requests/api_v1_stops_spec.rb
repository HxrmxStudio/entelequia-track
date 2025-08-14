require "rails_helper"

RSpec.describe "Api::V1::Stops", type: :request do
  let!(:order1) { Order.create!(external_ref: "O-1", status: "received") }
  let!(:order2) { Order.create!(external_ref: "O-2", status: "received") }
  let!(:shipment1) { Shipment.create!(order: order1, status: "queued", delivery_method: "courier") }
  let!(:shipment2) { Shipment.create!(order: order2, status: "queued", delivery_method: "courier") }
  let!(:courier) { Courier.create!(code: "C003", name: "Carlos Courier") }
  let!(:route) { Route.create!(service_date: Date.today, status: "planned", courier: courier) }
  let!(:stop1) { route.stops.create!(shipment: shipment1, sequence: 1, status: "pending") }
  let!(:stop2) { route.stops.create!(shipment: shipment2, sequence: 2, status: "pending") }

  describe "GET /api/v1/routes/:route_id/stops" do
    it "lists ordered stops" do
      get "/api/v1/routes/#{route.id}/stops"
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.map { |s| s["id"] }).to eq([stop1.id, stop2.id])
    end
  end

  describe "PATCH /api/v1/routes/:route_id/stops/resequence" do
    it "reorders stops atomically" do
      patch "/api/v1/routes/#{route.id}/stops/resequence", params: { order: [stop2.id, stop1.id] }
      expect(response).to have_http_status(:ok)
      expect(route.stops.order(:sequence).pluck(:id)).to eq([stop2.id, stop1.id])
    end
  end

  describe "PATCH /api/v1/routes/:route_id/stops/:id/complete" do
    it "completes a stop idempotently" do
      patch "/api/v1/routes/#{route.id}/stops/#{stop1.id}/complete"
      patch "/api/v1/routes/#{route.id}/stops/#{stop1.id}/complete"
      expect(response).to have_http_status(:ok)
      expect(stop1.reload.status).to eq("completed")
    end
  end

  describe "PATCH /api/v1/routes/:route_id/stops/:id/fail" do
    it "fails a stop with reason" do
      patch "/api/v1/routes/#{route.id}/stops/#{stop2.id}/fail", params: { reason: "customer_absent" }
      expect(response).to have_http_status(:ok)
      s = stop2.reload
      expect(s.status).to eq("failed")
      expect(s.notes["fail_reason"]).to eq("customer_absent")
    end
  end
end


