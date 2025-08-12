require "rails_helper"

RSpec.describe "CORS", type: :request do
  it "responds to OPTIONS preflight from panel origin" do
    headers = {
      "Origin" => "http://localhost:3001",
      "Access-Control-Request-Method" => "POST",
      "Access-Control-Request-Headers" => "Authorization, Content-Type"
    }
    process :options, "/auth/login", headers: headers
    expect(response.status).to be_between(200, 204)
    expect(response.headers["Access-Control-Allow-Origin"]).to eq("http://localhost:3001")
    expect(response.headers["Access-Control-Expose-Headers"]).to include("Authorization")
  end
end


