require "rails_helper"

RSpec.describe Auth::AuthService do
  let(:user) { create(:user, email: "test@example.com", password: "password123") }
  let(:client) { "test-client" }
  let(:device) { "test-device" }

  before do
    allow(ENV).to receive(:fetch).with("ACCESS_TOKEN_TTL_SECONDS", "900").and_return("900")
    allow(ENV).to receive(:fetch).with("JWT_SECRET").and_return("test-secret")
    allow(ENV).to receive(:fetch).with("REFRESH_TOKEN_TTL_DAYS", "30").and_return("30")
  end

  describe ".authenticate_user" do
    context "with valid credentials" do
      it "returns the user" do
        # Ensure the user is created and password is properly hashed
        user.reload
        result = described_class.authenticate_user(email: user.email, password: "password123")
        expect(result).to eq(user)
      end
    end

    context "with invalid email" do
      it "returns nil" do
        result = described_class.authenticate_user(email: "invalid@example.com", password: "password123")
        expect(result).to be_nil
      end
    end

    context "with invalid password" do
      it "returns nil" do
        result = described_class.authenticate_user(email: user.email, password: "wrongpassword")
        expect(result).to be_nil
      end
    end

    context "with missing email" do
      it "returns nil" do
        result = described_class.authenticate_user(email: nil, password: "password123")
        expect(result).to be_nil
      end
    end

    context "with missing password" do
      it "returns nil" do
        result = described_class.authenticate_user(email: user.email, password: nil)
        expect(result).to be_nil
      end
    end

    context "with empty email" do
      it "returns nil" do
        result = described_class.authenticate_user(email: "", password: "password123")
        expect(result).to be_nil
      end
    end

    context "with empty password" do
      it "returns nil" do
        result = described_class.authenticate_user(email: user.email, password: "")
        expect(result).to be_nil
      end
    end
  end

  describe ".create_user_session" do
    let(:access_token_data) { { token: "access-token", exp: Time.current.to_i + 900 } }
    let(:refresh_token) { "refresh-token" }
    let(:user_serializer_data) { { id: user.id, email: user.email, name: user.name, role: user.role } }

    before do
      allow(Auth::JwtService).to receive(:encode_access_token).with(sub: user.id).and_return(access_token_data)
      allow(Auth::RefreshTokenService).to receive(:create_for_user).with(user, client: client, device: device).and_return([refresh_token, double])
      allow(UserSerializer).to receive(:new).with(user).and_return(double(as_json: user_serializer_data))
    end

    it "creates a complete user session" do
      result = described_class.create_user_session(user, client: client, device: device)
      
      expect(result[:access_token]).to eq("access-token")
      expect(result[:exp]).to eq(Time.current.to_i + 900)
      expect(result[:refresh_token]).to eq("refresh-token")
      expect(result[:user]).to eq(user_serializer_data)
    end

    it "calls JwtService to generate access token" do
      expect(Auth::JwtService).to receive(:encode_access_token).with(sub: user.id)
      described_class.create_user_session(user, client: client, device: device)
    end

    it "calls RefreshTokenService to generate refresh token" do
      expect(Auth::RefreshTokenService).to receive(:create_for_user).with(user, client: client, device: device)
      described_class.create_user_session(user, client: client, device: device)
    end

    it "calls UserSerializer to serialize user data" do
      expect(UserSerializer).to receive(:new).with(user)
      described_class.create_user_session(user, client: client, device: device)
    end

    context "without client and device" do
      it "creates session with nil client and device" do
        allow(Auth::RefreshTokenService).to receive(:create_for_user).with(user, client: nil, device: nil).and_return([refresh_token, double])
        
        result = described_class.create_user_session(user)
        
        expect(result[:access_token]).to eq("access-token")
        expect(result[:refresh_token]).to eq("refresh-token")
      end
    end
  end

  describe ".refresh_user_session" do
    let(:refresh_token) { "valid-refresh-token" }
    let(:session_data) { { access_token: "new-access-token", user: { id: user.id } } }

    before do
      allow(Auth::RefreshTokenService).to receive(:validate_and_rotate).with(refresh_token, client: client, device: device).and_return(session_data)
    end

    it "calls RefreshTokenService to validate and rotate token" do
      expect(Auth::RefreshTokenService).to receive(:validate_and_rotate).with(refresh_token, client: client, device: device)
      described_class.refresh_user_session(refresh_token, client: client, device: device)
    end

    it "returns the session data from RefreshTokenService" do
      result = described_class.refresh_user_session(refresh_token, client: client, device: device)
      expect(result).to eq(session_data)
    end

    context "when refresh fails" do
      before do
        allow(Auth::RefreshTokenService).to receive(:validate_and_rotate).with(refresh_token, client: client, device: device).and_return(nil)
      end

      it "returns nil" do
        result = described_class.refresh_user_session(refresh_token, client: client, device: device)
        expect(result).to be_nil
      end
    end
  end

  describe ".revoke_user_session" do
    let(:refresh_token) { "valid-refresh-token" }
    let(:refresh_token_record) { double("RefreshToken") }

    before do
      allow(RefreshToken).to receive(:find_by_token).with(refresh_token).and_return(refresh_token_record)
      allow(refresh_token_record).to receive(:revoke!)
    end

    it "finds and revokes the refresh token" do
      expect(RefreshToken).to receive(:find_by_token).with(refresh_token)
      expect(refresh_token_record).to receive(:revoke!)
      described_class.revoke_user_session(refresh_token)
    end

    context "with nil token" do
      it "does nothing" do
        expect(RefreshToken).not_to receive(:find_by_token)
        described_class.revoke_user_session(nil)
      end
    end

    context "when token record is not found" do
      before do
        allow(RefreshToken).to receive(:find_by_token).with(refresh_token).and_return(nil)
      end

      it "does not raise an error" do
        expect { described_class.revoke_user_session(refresh_token) }.not_to raise_error
      end
    end
  end

  describe ".normalize_email" do
    it "converts email to lowercase" do
      result = described_class.normalize_email("TEST@EXAMPLE.COM")
      expect(result).to eq("test@example.com")
    end

    it "strips whitespace" do
      result = described_class.normalize_email("  test@example.com  ")
      expect(result).to eq("test@example.com")
    end

    it "returns nil for non-string input" do
      result = described_class.normalize_email(123)
      expect(result).to be_nil
    end

    it "returns nil for nil input" do
      result = described_class.normalize_email(nil)
      expect(result).to be_nil
    end

    it "handles empty string" do
      result = described_class.normalize_email("")
      expect(result).to be_nil
    end
  end
end
