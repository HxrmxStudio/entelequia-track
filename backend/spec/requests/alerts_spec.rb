require "rails_helper"

RSpec.describe "Api::V1::Alerts", type: :request do
  let!(:user) { User.create!(email: "ops@example.com", password_digest: "x", role: "ops", name: "Ops") }
  let(:auth) { auth_header_for(user) }

  describe "GET /api/v1/alerts" do
    it "lists alerts with filters and compact payload" do
      courier = Courier.create!(code: "C001", name: "John Doe")
      a1 = Alert.create!(code: "gps_offline", kind: "courier", status: "open", severity: "warning", message: "m1", courier: courier, first_detected_at: Time.current - 5.minutes, last_detected_at: Time.current - 5.minutes, data: { minutes_offline: 10 })
      get "/api/v1/alerts", params: { status: "open", type: "gps_offline" }, headers: auth
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body).to be_an(Array)
      expect(body.first.keys).to include("id", "type", "status", "resource", "payload", "created_at")
      expect(body.first["type"]).to eq("gps_offline")
      expect(body.first["status"]).to eq("open")
      expect(body.first["resource"]).to eq({ "type" => "Courier", "id" => courier.id })
    end

    it "filters by since and resource filters" do
      courier = Courier.create!(code: "C003", name: "Since Tester")
      a_old = Alert.create!(code: "gps_offline", kind: "courier", status: "resolved", severity: "warning", message: "old", courier: courier, first_detected_at: 2.days.ago, last_detected_at: 2.days.ago, data: {})
      a_new = Alert.create!(code: "gps_offline", kind: "courier", status: "open", severity: "warning", message: "new", courier: courier, first_detected_at: 10.minutes.ago, last_detected_at: 10.minutes.ago, data: {})

      get "/api/v1/alerts", params: { since: (Time.current - 1.hour).iso8601, resource_type: "Courier", resource_id: courier.id }, headers: auth
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      ids = body.map { |h| h["id"] }
      expect(ids).to include(a_new.id)
      expect(ids).not_to include(a_old.id)
    end

    it "caps limit at 500" do
      user = User.create!(email: "cap@example.com", password_digest: "x", role: "ops", name: "Ops")
      courier = Courier.create!(code: "C004", name: "Cap")
      # create 600 alerts resolved to bypass unique open constraint
      600.times do |i|
        Alert.create!(code: "gps_offline", kind: "courier", status: "resolved", severity: "warning", message: "m#{i}", courier: courier, first_detected_at: Time.current, last_detected_at: Time.current, data: {})
      end
      get "/api/v1/alerts", params: { limit: 1000 }, headers: auth
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body.length).to eq(500)
    end
  end
  describe "GET /api/v1/alerts/:id" do
    it "returns compact payload for a single alert" do
      courier = Courier.create!(code: "C005", name: "ShowOne")
      alert = Alert.create!(code: "gps_offline", kind: "courier", status: "open", severity: "warning", message: "m", courier: courier, first_detected_at: Time.current, last_detected_at: Time.current, data: { minutes_offline: 12 })
      get "/api/v1/alerts/#{alert.id}", headers: auth
      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["id"]).to eq(alert.id)
      expect(body["type"]).to eq("gps_offline")
      expect(body["resource"]).to eq({ "type" => "Courier", "id" => courier.id })
    end
  end

  describe "POST /api/v1/alerts/:id/resolve" do
    it "resolves an alert and publishes realtime event" do
      courier = Courier.create!(code: "C002", name: "Jane Doe")
      alert = Alert.create!(code: "gps_offline", kind: "courier", status: "open", severity: "warning", message: "m1", courier: courier, first_detected_at: Time.current - 10.minutes, last_detected_at: Time.current - 5.minutes, data: {})

      received = []
      token = RealtimeBus.subscribe { |payload| received << payload }
      post "/api/v1/alerts/#{alert.id}/resolve", params: { note: "ok" }, headers: auth
      RealtimeBus.unsubscribe(token)

      expect(response).to have_http_status(:ok)
      alert.reload
      expect(alert.status).to eq("resolved")
      expect(alert.data["resolution_note"]).to eq("ok")
      expect(received.any? { |p| p[:type] == "alert.resolved" && p[:data][:id] == alert.id }).to be(true)
    end
  end
end


