require "rails_helper"

RSpec.describe "AuthController", type: :request do
  let(:user) { create(:user) } # Use create(:user) from FactoryBot
  let(:valid_credentials) { { email: user.email, password: "password123" } }
  let(:invalid_credentials) { { email: user.email, password: "wrongpassword" } }
  let(:session_data) do
    {
      access_token: "access-token-123",
      exp: Time.current.to_i + 900,
      refresh_token: "refresh-token-123",
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    }
  end

  before do
    # Stub all environment variables that the services might use
    allow(ENV).to receive(:fetch).with("ACCESS_TOKEN_TTL_SECONDS", "900").and_return("900")
    allow(ENV).to receive(:[]).with("JWT_SECRET").and_return("test-secret")
    allow(ENV).to receive(:fetch).with("REFRESH_TOKEN_TTL_DAYS", "30").and_return("30")
  end

  describe "POST /auth/login" do
    context "with valid credentials" do
      before do
        allow(Auth::AuthService).to receive(:authenticate_user).and_return(user)
        allow(Auth::AuthService).to receive(:create_user_session).and_return(session_data)
        allow(Auth::TokenService).to receive(:set_refresh_token_cookie)
      end

      it "returns success with access token and user data" do
        post "/auth/login", params: valid_credentials, as: :json
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        expect(json_response["access_token"]).to eq("access-token-123")
        expect(json_response["exp"]).to eq(Time.current.to_i + 900)
        expect(json_response["token_type"]).to eq("Bearer")
        expect(json_response["user"]["id"]).to eq(user.id)
        expect(json_response["user"]["email"]).to eq(user.email)
      end

      it "sets the refresh token cookie" do
        expect(Auth::TokenService).to receive(:set_refresh_token_cookie).with(anything, "refresh-token-123")
        post "/auth/login", params: valid_credentials, as: :json
      end

      it "calls AuthService.authenticate_user" do
        expect(Auth::AuthService).to receive(:authenticate_user).with(email: user.email, password: "password123")
        post "/auth/login", params: valid_credentials, as: :json
      end

      it "calls AuthService.create_user_session" do
        expect(Auth::AuthService).to receive(:create_user_session).with(user, client: nil, device: nil)
        post "/auth/login", params: valid_credentials, as: :json
      end

      context "with client and device" do
        let(:credentials_with_device) { valid_credentials.merge(device: "mobile-app") }
        
        before do
          allow(Auth::AuthService).to receive(:create_user_session).with(user, client: anything, device: "mobile-app").and_return(session_data)
        end

        it "passes client and device to create_user_session" do
          expect(Auth::AuthService).to receive(:create_user_session).with(user, client: anything, device: "mobile-app")
          post "/auth/login", params: credentials_with_device, as: :json
        end
      end
    end

    context "with invalid credentials" do
      before do
        allow(Auth::AuthService).to receive(:authenticate_user).and_return(nil)
      end

      it "returns unauthorized status" do
        post "/auth/login", params: invalid_credentials, as: :json
        
        expect(response).to have_http_status(:unauthorized)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to eq("Invalid credentials")
      end
    end

    context "with missing parameters" do
      it "returns unprocessable entity for missing email" do
        post "/auth/login", params: { password: "password123" }, as: :json
        
        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to eq("missing_parameters")
      end

      it "returns unprocessable entity for missing password" do
        post "/auth/login", params: { email: user.email }, as: :json
        
        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to eq("missing_parameters")
      end
    end
  end

  describe "POST /auth/refresh" do
    let(:refresh_token) { "valid-refresh-token" }
    let(:new_session_data) do
      {
        access_token: "new-access-token-123",
        exp: Time.current.to_i + 900,
        refresh_token: "new-refresh-token-123",
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      }
    end

    context "with valid refresh token" do
      before do
        allow(Auth::TokenService).to receive(:extract_refresh_token).and_return(refresh_token)
        allow(Auth::AuthService).to receive(:refresh_user_session).and_return(new_session_data)
        allow(Auth::TokenService).to receive(:set_refresh_token_cookie)
      end

      it "returns new access token and user data" do
        post "/auth/refresh", as: :json
        
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        
        expect(json_response["access_token"]).to eq("new-access-token-123")
        expect(json_response["exp"]).to eq(Time.current.to_i + 900)
        expect(json_response["token_type"]).to eq("Bearer")
        expect(json_response["user"]["id"]).to eq(user.id)
      end

      it "sets new refresh token cookie" do
        expect(Auth::TokenService).to receive(:set_refresh_token_cookie).with(anything, "new-refresh-token-123")
        post "/auth/refresh", as: :json
      end

      it "calls AuthService.refresh_user_session" do
        expect(Auth::AuthService).to receive(:refresh_user_session).with(refresh_token, client: nil, device: nil)
        post "/auth/refresh", as: :json
      end
    end

    context "with missing refresh token" do
      before do
        allow(Auth::TokenService).to receive(:extract_refresh_token).and_return(nil)
      end

      it "returns unauthorized status" do
        post "/auth/refresh", as: :json
        
        expect(response).to have_http_status(:unauthorized)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to eq("missing_refresh_token")
      end
    end

    context "with invalid refresh token" do
      before do
        allow(Auth::TokenService).to receive(:extract_refresh_token).and_return(refresh_token)
        allow(Auth::AuthService).to receive(:refresh_user_session).and_return(nil)
      end

      it "returns unauthorized status" do
        post "/auth/refresh", as: :json
        
        expect(response).to have_http_status(:unauthorized)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to eq("invalid_refresh_token")
      end
    end
  end

  describe "POST /auth/logout" do
    let(:refresh_token) { "valid-refresh-token" }

    context "with valid refresh token" do
      before do
        allow(Auth::TokenService).to receive(:extract_refresh_token).and_return(refresh_token)
        allow(Auth::AuthService).to receive(:revoke_user_session)
        allow(Auth::TokenService).to receive(:clear_refresh_token_cookie)
      end

      it "returns no content status" do
        post "/auth/logout", as: :json
        
        expect(response).to have_http_status(:no_content)
      end

      it "revokes the refresh token" do
        expect(Auth::AuthService).to receive(:revoke_user_session).with(refresh_token)
        post "/auth/logout", as: :json
      end

      it "clears the refresh token cookie" do
        expect(Auth::TokenService).to receive(:clear_refresh_token_cookie).with(anything)
        post "/auth/logout", as: :json
      end
    end

    context "without refresh token" do
      before do
        allow(Auth::TokenService).to receive(:extract_refresh_token).and_return(nil)
        allow(Auth::TokenService).to receive(:clear_refresh_token_cookie)
      end

      it "still returns no content status" do
        post "/auth/logout", as: :json
        
        expect(response).to have_http_status(:no_content)
      end

      it "does not call revoke_user_session" do
        expect(Auth::AuthService).not_to receive(:revoke_user_session)
        post "/auth/logout", as: :json
      end
    end
  end

  describe "POST /auth/register" do
    let(:new_user_attributes) do
      {
        email: "newuser@example.com",
        password: "newpassword123",
        name: "New User",
        role: "ops"
      }
    end

    let(:new_user) { build(:user, new_user_attributes) }
    let(:registration_session_data) do
      {
        access_token: "access-token-456",
        exp: Time.current.to_i + 900,
        refresh_token: "refresh-token-456",
        user: { id: new_user.id, email: new_user.email, name: new_user.name, role: new_user.role }
      }
    end

    context "with valid parameters" do
      before do
        allow(User).to receive(:new).and_return(new_user)
        allow(new_user).to receive(:save).and_return(true)
        allow(Auth::AuthService).to receive(:create_user_session).and_return(registration_session_data)
        allow(Auth::TokenService).to receive(:set_refresh_token_cookie)
      end

      it "creates a new user and returns success" do
        post "/auth/register", params: new_user_attributes, as: :json
        
        expect(response).to have_http_status(:created)
        json_response = JSON.parse(response.body)
        
        expect(json_response["access_token"]).to eq("access-token-456")
        expect(json_response["exp"]).to eq(Time.current.to_i + 900)
        expect(json_response["token_type"]).to eq("Bearer")
        expect(json_response["user"]["email"]).to eq("newuser@example.com")
      end

      it "sets the refresh token cookie" do
        expect(Auth::TokenService).to receive(:set_refresh_token_cookie).with(anything, "refresh-token-456")
        post "/auth/register", params: new_user_attributes, as: :json
      end
    end

    context "with existing email" do
      before do
        allow(User).to receive(:new).and_return(new_user)
        allow(new_user).to receive(:save).and_return(false)
        allow(new_user).to receive(:errors).and_return(double(full_messages: ["Email has already been taken"]))
      end

      it "returns unprocessable entity" do
        post "/auth/register", params: new_user_attributes, as: :json
        
        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to eq("validation_failed")
      end
    end

    context "with missing parameters" do
      it "returns unprocessable entity for missing email" do
        post "/auth/register", params: { password: "password123", name: "User", role: "ops" }, as: :json
        
        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to eq("missing_parameters")
      end

      it "returns unprocessable entity for missing password" do
        post "/auth/register", params: { email: "user@example.com", name: "User", role: "ops" }, as: :json
        
        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to eq("missing_parameters")
      end
    end

    context "with validation errors" do
      before do
        allow(User).to receive(:new).and_return(new_user)
        allow(new_user).to receive(:save).and_return(false)
        allow(new_user).to receive(:errors).and_return(double(full_messages: ["Email is invalid", "Password is too short"]))
      end

      it "returns unprocessable entity with validation details" do
        post "/auth/register", params: new_user_attributes, as: :json
        
        expect(response).to have_http_status(:unprocessable_entity)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to eq("validation_failed")
        expect(json_response["details"]).to include("Email is invalid", "Password is too short")
      end
    end
  end
end
