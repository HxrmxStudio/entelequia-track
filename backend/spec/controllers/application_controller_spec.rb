require "rails_helper"

RSpec.describe ApplicationController, type: :controller do
  controller do
    def index
      render json: { message: "success" }
    end

    def show
      authenticate_user!
      render json: { message: "authenticated" }
    end

    def update
      require_role!(:admin)
      render json: { message: "admin_only" }
    end
  end

  let(:user) { create(:user, role: "admin") }
  let(:valid_token) { "valid-access-token" }
  let(:invalid_token) { "invalid-token" }
  let(:expired_token) { "expired-token" }
  let(:valid_payload) do
    {
      "sub" => user.id,
      "iat" => Time.current.to_i,
      "exp" => Time.current.to_i + 900,
      "type" => "access"
    }
  end

  before do
    # Stub all environment variables that the services might use
    allow(ENV).to receive(:fetch).with("ACCESS_TOKEN_TTL_SECONDS", "900").and_return("900")
    allow(ENV).to receive(:[]).with("JWT_SECRET").and_return("test-secret")
    allow(ENV).to receive(:fetch).with("REFRESH_TOKEN_TTL_DAYS", "30").and_return("30")
    
    routes.draw do
      get "index" => "anonymous#index"
      get "show" => "anonymous#show"
      patch "update" => "anonymous#update"
    end
  end

  describe "#set_current_user" do
    context "with valid access token" do
      before do
        allow(Auth::TokenService).to receive(:validate_access_token).with(valid_token).and_return(valid_payload)
        request.headers["Authorization"] = "Bearer #{valid_token}"
      end

      it "sets @current_user" do
        get :show
        expect(assigns(:current_user)).to eq(user)
      end

      it "allows the request to proceed" do
        get :show
        expect(response).to have_http_status(:ok)
      end
    end

    context "with invalid access token" do
      before do
        allow(Auth::TokenService).to receive(:validate_access_token).with(invalid_token).and_return(nil)
        request.headers["Authorization"] = "Bearer #{invalid_token}"
      end

      it "does not set @current_user" do
        get :show
        expect(assigns(:current_user)).to be_nil
      end

      it "returns unauthorized" do
        get :show
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with expired access token" do
      before do
        allow(Auth::TokenService).to receive(:validate_access_token).with(expired_token).and_return(nil)
        request.headers["Authorization"] = "Bearer #{expired_token}"
      end

      it "does not set @current_user" do
        get :show
        expect(assigns(:current_user)).to be_nil
      end

      it "returns unauthorized" do
        get :show
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with missing Authorization header" do
      it "does not set @current_user" do
        get :show
        expect(assigns(:current_user)).to be_nil
      end

      it "returns unauthorized" do
        get :show
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with malformed Authorization header" do
      before do
        request.headers["Authorization"] = "InvalidFormat"
      end

      it "does not set @current_user" do
        get :show
        expect(assigns(:current_user)).to be_nil
      end

      it "returns unauthorized" do
        get :show
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with empty token" do
      before do
        request.headers["Authorization"] = "Bearer "
      end

      it "does not set @current_user" do
        get :show
        expect(assigns(:current_user)).to be_nil
      end

      it "returns unauthorized" do
        get :show
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with non-access token type" do
      let(:refresh_token_payload) do
        {
          "sub" => user.id,
          "iat" => Time.current.to_i,
          "exp" => Time.current.to_i + 900,
          "type" => "refresh"
        }
      end

      before do
        allow(Auth::TokenService).to receive(:validate_access_token).with(valid_token).and_return(refresh_token_payload)
        request.headers["Authorization"] = "Bearer #{valid_token}"
      end

      it "does not set @current_user" do
        get :show
        expect(assigns(:current_user)).to be_nil
      end

      it "returns unauthorized" do
        get :show
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "#authenticate_user!" do
    context "when user is authenticated" do
      before do
        allow(Auth::TokenService).to receive(:validate_access_token).with(valid_token).and_return(valid_payload)
        request.headers["Authorization"] = "Bearer #{valid_token}"
      end

      it "allows the request to proceed" do
        get :show
        expect(response).to have_http_status(:ok)
      end
    end

    context "when user is not authenticated" do
      it "returns unauthorized" do
        get :show
        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "#require_role!" do
    context "when user has the required role" do
      before do
        allow(Auth::TokenService).to receive(:validate_access_token).with(valid_token).and_return(valid_payload)
        request.headers["Authorization"] = "Bearer #{valid_token}"
      end

      it "allows the request to proceed" do
        patch :update
        expect(response).to have_http_status(:ok)
      end
    end

    context "when user does not have the required role" do
      let(:non_admin_user) { create(:user, role: "ops") }
      let(:non_admin_payload) do
        {
          "sub" => non_admin_user.id,
          "iat" => Time.current.to_i,
          "exp" => Time.current.to_i + 900,
          "type" => "access"
        }
      end

      before do
        allow(Auth::TokenService).to receive(:validate_access_token).with(valid_token).and_return(non_admin_payload)
        request.headers["Authorization"] = "Bearer #{valid_token}"
      end

      it "returns forbidden" do
        patch :update
        expect(response).to have_http_status(:forbidden)
      end
    end

    context "when user is not authenticated" do
      it "returns unauthorized" do
        patch :update
        expect(response).to have_http_status(:unauthorized)
      end
    end

    context "with multiple required roles" do
      controller do
        def multi_role_action
          require_role!(:admin, :ops)
          render json: { message: "multi_role" }
        end
      end

      before do
        routes.draw do
          get "multi_role_action" => "anonymous#multi_role_action"
        end
      end

      context "when user has one of the required roles" do
        before do
          allow(Auth::TokenService).to receive(:validate_access_token).with(valid_token).and_return(valid_payload)
          request.headers["Authorization"] = "Bearer #{valid_token}"
        end

        it "allows the request to proceed" do
          get :multi_role_action
          expect(response).to have_http_status(:ok)
        end
      end

      context "when user has none of the required roles" do
        let(:courier_user) { create(:user, role: "courier") }
        let(:courier_payload) do
          {
            "sub" => courier_user.id,
            "iat" => Time.current.to_i,
            "exp" => Time.current.to_i + 900,
            "type" => "access"
          }
        end

        before do
          allow(Auth::TokenService).to receive(:validate_access_token).with(valid_token).and_return(courier_payload)
          request.headers["Authorization"] = "Bearer #{valid_token}"
        end

        it "returns forbidden" do
          get :multi_role_action
          expect(response).to have_http_status(:forbidden)
        end
      end
    end
  end

  describe "TokenService integration" do
    it "calls TokenService.validate_access_token with the extracted token" do
      expect(Auth::TokenService).to receive(:validate_access_token).with(valid_token).and_return(valid_payload)
      request.headers["Authorization"] = "Bearer #{valid_token}"
      get :show
    end

    it "handles TokenService returning nil gracefully" do
      allow(Auth::TokenService).to receive(:validate_access_token).with(valid_token).and_return(nil)
      request.headers["Authorization"] = "Bearer #{valid_token}"
      get :show
      expect(response).to have_http_status(:unauthorized)
    end
  end
end
