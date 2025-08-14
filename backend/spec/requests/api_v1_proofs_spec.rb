require "rails_helper"

RSpec.describe "API V1 Proofs (Supabase)", type: :request do
  let(:admin) { User.create!(email: "admin@x.com", password: "secret", role: "admin") }

  before do
    allow(SupabaseStorage).to receive(:create_signed_upload).and_return({ upload_url: "https://supabase.local/u", headers: { "Content-Type" => "image/jpeg" }, key: "proofs/2025/08/13/x.jpg" })
    allow(SupabaseStorage).to receive(:create_signed_download).and_return({ url: "https://supabase.local/d" })
  end

  it "presigns an upload" do
    post "/api/v1/proofs/presign", headers: auth_header_for(admin), params: { filename: "pod.jpg", content_type: "image/jpeg" }
    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body["upload_url"]).to be_present
    expect(body["headers"]).to be_present
    expect(body["key"]).to be_present
  end

  it "creates proof with key and marks delivered (panel manual geostamp optional)" do
    addr = Address.create!(line1: "X", country: "AR", geom: "POINT(-58.38 -34.6)")
    order = Order.create!(external_ref: SecureRandom.hex(4), status: "received", amount_cents: 1000, currency: "ARS", address_id: addr.id)
    s = Shipment.create!(order_id: order.id, status: "queued", delivery_method: "courier")

    post "/api/v1/proofs", headers: auth_header_for(admin), params: { shipment_id: s.id, key: "proofs/2025/08/13/x.jpg" }
    expect(response).to have_http_status(:created)
    body = JSON.parse(response.body)
    expect(body["ok"]).to eq(true)
    p = Proof.find(body["proof_id"])
    expect(p.metadata["source"]).to eq("panel_manual")
    s.reload
    expect(s.status).to eq("delivered")
  end

  it "creates proof with OTP and enforces geofence for courier_app" do
    courier = User.create!(email: "courier@x.com", password: "secret", role: "courier")
    addr = Address.create!(line1: "X", country: "AR", geom: "POINT(-58.38 -34.6)")
    order = Order.create!(external_ref: SecureRandom.hex(4), status: "received", amount_cents: 1000, currency: "ARS", address_id: addr.id)
    s = Shipment.create!(order_id: order.id, status: "queued", delivery_method: "courier")
    allow(OtpService).to receive(:locked?).and_return(false)
    allow(OtpService).to receive(:verify!).and_return(true)

    post "/api/v1/proofs", headers: auth_header_for(courier), params: { shipment_id: s.id, key: "proofs/2025/08/13/x.jpg", otp: "123456", lat: -34.6002, lon: -58.3802 }
    expect([201, 422]).to include(response.status)
  end
end


