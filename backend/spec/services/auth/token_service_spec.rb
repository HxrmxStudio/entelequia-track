require "rails_helper"

RSpec.describe Auth::TokenService do
  let(:request) { double("request") }
  let(:cookies) { double("cookies") }
  let(:token) { "valid-refresh-token" }
  let(:access_token) { "valid-access-token" }

  before do
    allow(ENV).to receive(:fetch).with("REFRESH_TOKEN_TTL_DAYS", "30").and_return("30")
  end

  describe ".extract_refresh_token" do
    context "when token is in cookies" do
      before do
        allow(cookies).to receive(:encrypted).and_return({ rt: token })
        allow(request).to receive(:headers).and_return({})
      end

      it "returns the token from cookies" do
        result = described_class.extract_refresh_token(request, cookies)
        expect(result).to eq(token)
      end
    end

    context "when token is in Authorization header" do
      before do
        allow(cookies).to receive(:encrypted).and_return({ rt: nil })
        allow(request).to receive(:headers).and_return({ "Authorization" => "Bearer #{token}" })
      end

      it "returns the token from Authorization header" do
        result = described_class.extract_refresh_token(request, cookies)
        expect(result).to eq(token)
      end
    end

    context "when no token is present" do
      before do
        allow(cookies).to receive(:encrypted).and_return({ rt: nil })
        allow(request).to receive(:headers).and_return({})
      end

      it "returns nil" do
        result = described_class.extract_refresh_token(request, cookies)
        expect(result).to be_nil
      end
    end

    context "when Authorization header doesn't start with Bearer" do
      before do
        allow(cookies).to receive(:encrypted).and_return({ rt: nil })
        allow(request).to receive(:headers).and_return({ "Authorization" => "Basic #{token}" })
      end

      it "returns nil" do
        result = described_class.extract_refresh_token(request, cookies)
        expect(result).to be_nil
      end
    end
  end

  describe ".set_refresh_token_cookie" do
    let(:cookie_options) do
      {
        value: token,
        httponly: true,
        secure: false, # development environment
        same_site: :lax,
        path: "/api/v1/auth/refresh",
        expires: 30.days.from_now
      }
    end

    before do
      allow(Rails.env).to receive(:production?).and_return(false)
    end

    it "sets the refresh token cookie with correct options" do
      # Configure the double to handle the assignment syntax
      encrypted_cookies = {}
      allow(cookies).to receive(:encrypted).and_return(encrypted_cookies)
      
      described_class.set_refresh_token_cookie(cookies, token)
      
      expect(encrypted_cookies[:rt]).to include(
        value: token,
        httponly: true,
        secure: false,
        same_site: :lax,
        path: "/api/v1/auth/refresh"
      )
      expect(encrypted_cookies[:rt][:expires]).to be_within(1.second).of(30.days.from_now)
    end

    it "uses secure: true in production" do
      allow(Rails.env).to receive(:production?).and_return(true)
      
      # Configure the double to handle the assignment syntax
      encrypted_cookies = {}
      allow(cookies).to receive(:encrypted).and_return(encrypted_cookies)
      
      described_class.set_refresh_token_cookie(cookies, token)
      
      expect(encrypted_cookies[:rt][:secure]).to be true
    end
  end

  describe ".clear_refresh_token_cookie" do
    it "deletes the refresh token cookie" do
      expect(cookies).to receive(:delete).with(:rt, path: "/api/v1/auth/refresh")
      described_class.clear_refresh_token_cookie(cookies)
    end
  end

  describe ".validate_access_token" do
    let(:valid_payload) do
      {
        "sub" => "user-123",
        "iat" => Time.current.to_i,
        "exp" => Time.current.to_i + 900,
        "type" => "access"
      }
    end

    let(:invalid_payload) do
      {
        "sub" => "user-123",
        "iat" => Time.current.to_i,
        "exp" => Time.current.to_i + 900,
        "type" => "refresh"
      }
    end

    context "with valid access token" do
      before do
        allow(Auth::JwtService).to receive(:decode_token).with(access_token).and_return([valid_payload, {}])
      end

      it "returns the payload" do
        result = described_class.validate_access_token(access_token)
        expect(result).to eq(valid_payload)
      end
    end

    context "with invalid token type" do
      before do
        allow(Auth::JwtService).to receive(:decode_token).with(access_token).and_return([invalid_payload, {}])
      end

      it "returns nil" do
        result = described_class.validate_access_token(access_token)
        expect(result).to be_nil
      end
    end

    context "with nil token" do
      it "returns nil" do
        result = described_class.validate_access_token(nil)
        expect(result).to be_nil
      end
    end

    context "with empty token" do
      it "returns nil" do
        result = described_class.validate_access_token("")
        expect(result).to be_nil
      end
    end

    context "when JWT decode fails" do
      before do
        allow(Auth::JwtService).to receive(:decode_token).with(access_token).and_return(nil)
      end

      it "returns nil" do
        result = described_class.validate_access_token(access_token)
        expect(result).to be_nil
      end
    end

    context "when JWT decode raises an error" do
      before do
        allow(Auth::JwtService).to receive(:decode_token).with(access_token).and_raise(JWT::DecodeError)
      end

      it "returns nil" do
        result = described_class.validate_access_token(access_token)
        expect(result).to be_nil
      end
    end
  end
end
