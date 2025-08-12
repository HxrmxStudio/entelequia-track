require "rails_helper"

RSpec.describe "Auth", type: :request do
  it "logs in with valid credentials" do
    user = User.create!(email: "test@x.com", password: "secret", role: "ops")
    post "/auth/login", params: { email: user.email, password: "secret" }
    expect(response).to have_http_status(:ok)
    body = JSON.parse(response.body)
    expect(body).to include("token", "exp", "token_type", "user")
    expect(body["token_type"]).to eq("Bearer")
    expect(body["user"]["email"]).to eq("test@x.com")
  end

  it "normalizes email (strip + downcase)" do
    user = User.create!(email: "user@example.com", password: "secret", role: "ops")
    post "/auth/login", params: { email: "  USER@EXAMPLE.COM  ", password: "secret" }
    expect(response).to have_http_status(:ok)
  end

  it "returns 401 with generic error on invalid credentials" do
    user = User.create!(email: "ops@x.com", password: "secret", role: "ops")
    post "/auth/login", params: { email: user.email, password: "wrong" }
    expect(response).to have_http_status(:unauthorized)
    expect(JSON.parse(response.body)["error"]).to eq("Invalid credentials")
  end

  it "returns 422 when missing parameters" do
    post "/auth/login", params: { email: "" }
    expect(response).to have_http_status(:unprocessable_entity)
  end
end
