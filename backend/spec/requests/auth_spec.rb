require "rails_helper"

RSpec.describe "Auth", type: :request do
  it "logs in with valid credentials" do
    user = User.create!(email: "test@x.com", password: "secret", role: "ops")
    post "/auth/login", params: { email: user.email, password: "secret" }
    expect(response).to have_http_status(:ok)
    expect(JSON.parse(response.body)).to include("token")
  end
end
