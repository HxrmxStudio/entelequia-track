require "rails_helper"

RSpec.describe "Api::V1::Routes", type: :request do
  let!(:courier) { Courier.create!(code: "C001", name: "John Doe") }
  let!(:other_courier) { Courier.create!(code: "C002", name: "Jane Doe") }
  let!(:third_courier) { Courier.create!(code: "C003", name: "Max Mustermann") }
  let!(:route1) { Route.create!(service_date: Date.today, status: "planned", courier: courier) }
  let!(:route2) { Route.create!(service_date: Date.today, status: "planned", courier: other_courier) }

  describe "GET /api/v1/routes" do
    it "filters by courier_id" do
      get "/api/v1/routes", params: { courier_id: courier.id }
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to be_an(Array)
      expect(body.map { |r| r["id"] }).to include(route1.id)
      expect(body.map { |r| r["id"] }).not_to include(route2.id)
    end
  end

  describe "PATCH /api/v1/routes/:id/assign_courier" do
    it "assigns a courier" do
      patch "/api/v1/routes/#{route2.id}/assign_courier", params: { courier_id: third_courier.id }
      expect(response).to have_http_status(:ok)
      expect(route2.reload.courier_id).to eq(third_courier.id)
    end
  end

  describe "PATCH /api/v1/routes/:id/start" do
    it "marks route as in_progress idempotently" do
      2.times { patch "/api/v1/routes/#{route1.id}/start" }
      expect(response).to have_http_status(:ok)
      expect(route1.reload.status).to eq("in_progress")
    end
  end

  describe "PATCH /api/v1/routes/:id/complete" do
    it "marks route as completed idempotently" do
      patch "/api/v1/routes/#{route1.id}/complete"
      patch "/api/v1/routes/#{route1.id}/complete"
      expect(response).to have_http_status(:ok)
      expect(route1.reload.status).to eq("completed")
    end
  end
end


