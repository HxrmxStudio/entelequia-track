require "rails_helper"

RSpec.describe Auth::JwtService do
  let(:user_id) { "user-123" }
  let(:secret) { "test-secret" }

  before do
    # Stub all environment variables that the service might use
    allow(ENV).to receive(:fetch).with("ACCESS_TOKEN_TTL_SECONDS", "900").and_return("900")
    allow(ENV).to receive(:[]).with("JWT_SECRET").and_return(secret)
    allow(ENV).to receive(:fetch).with("REFRESH_TOKEN_TTL_DAYS", "30").and_return("30")
  end

  describe ".access_token_ttl_seconds" do
    it "returns the configured TTL from environment" do
      expect(described_class.access_token_ttl_seconds).to eq(900)
    end

    it "defaults to 900 seconds when not configured" do
      allow(ENV).to receive(:fetch).with("ACCESS_TOKEN_TTL_SECONDS", "900").and_return("600")
      expect(described_class.access_token_ttl_seconds).to eq(600)
    end
  end

  describe ".secret" do
    it "returns the JWT secret from environment" do
      expect(described_class.secret).to eq(secret)
    end

    it "falls back to credentials when ENV is not set" do
      # First stub the ENV to return nil, then stub credentials
      allow(ENV).to receive(:[]).with("JWT_SECRET").and_return(nil)
      allow(Rails.application.credentials).to receive(:jwt_secret).and_return("credential-secret")
      expect(described_class.secret).to eq("credential-secret")
    end

    it "falls back to default when neither ENV nor credentials are available" do
      # First stub the ENV to return nil, then stub credentials to return nil
      allow(ENV).to receive(:[]).with("JWT_SECRET").and_return(nil)
      allow(Rails.application.credentials).to receive(:jwt_secret).and_return(nil)
      expect(described_class.secret).to eq("PutoElQueLoLee")
    end
  end

  describe ".algorithm" do
    it "returns HS256" do
      expect(described_class.algorithm).to eq("HS256")
    end
  end

  describe ".encode_access_token" do
    it "creates a valid JWT token with correct payload" do
      travel_to Time.zone.parse("2025-01-15 10:00:00") do
        result = described_class.encode_access_token(sub: user_id)
        
        expect(result).to have_key(:token)
        expect(result).to have_key(:exp)
        expect(result[:exp]).to eq(Time.current.to_i + 900)
        
        # Decode and verify the token
        decoded = JWT.decode(result[:token], secret, true, algorithm: "HS256")
        payload = decoded[0]
        
        expect(payload["sub"]).to eq(user_id)
        expect(payload["iat"]).to eq(Time.current.to_i)
        expect(payload["exp"]).to eq(Time.current.to_i + 900)
        expect(payload["type"]).to eq("access")
      end
    end
  end

  describe ".decode_token" do
    let(:valid_token) { described_class.encode_access_token(sub: user_id)[:token] }

    it "successfully decodes a valid token" do
      result = described_class.decode_token(valid_token)
      expect(result).to be_an(Array)
      expect(result[0]["sub"]).to eq(user_id)
    end

    it "returns nil for expired tokens" do
      # Create an expired token by temporarily changing the TTL
      allow(ENV).to receive(:fetch).with("ACCESS_TOKEN_TTL_SECONDS", "900").and_return("-1")
      expired_token = described_class.encode_access_token(sub: user_id)[:token]
      
      # Restore the original TTL
      allow(ENV).to receive(:fetch).with("ACCESS_TOKEN_TTL_SECONDS", "900").and_return("900")
      
      result = described_class.decode_token(expired_token)
      expect(result).to be_nil
    end

    it "returns nil for invalid tokens" do
      result = described_class.decode_token("invalid-token")
      expect(result).to be_nil
    end

    it "returns nil for malformed tokens" do
      result = described_class.decode_token("not.a.valid.jwt")
      expect(result).to be_nil
    end
  end

  describe ".ttl_seconds (legacy)" do
    it "returns the same value as access_token_ttl_seconds" do
      expect(described_class.ttl_seconds).to eq(described_class.access_token_ttl_seconds)
    end
  end

  describe ".encode (legacy)" do
    it "calls encode_access_token" do
      expect(described_class).to receive(:encode_access_token).with(sub: user_id)
      described_class.encode(sub: user_id)
    end
  end
end
