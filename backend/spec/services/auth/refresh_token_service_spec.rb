require "rails_helper"

RSpec.describe Auth::RefreshTokenService do
  let(:user) { create(:user) }

  before do
    # Stub all environment variables that the service might use
    allow(ENV).to receive(:fetch).with("ACCESS_TOKEN_TTL_SECONDS", "900").and_return("900")
    allow(ENV).to receive(:[]).with("JWT_SECRET").and_return("test-secret")
    allow(ENV).to receive(:fetch).with("REFRESH_TOKEN_TTL_DAYS", "30").and_return("30")
  end

  describe ".create_for_user" do
    it "creates a new refresh token for the user" do
      token, refresh_token = described_class.create_for_user(user)
      
      expect(token).to be_present
      expect(refresh_token).to be_a(RefreshToken)
      expect(refresh_token.user).to eq(user)
    end

    it "revokes any existing active tokens for the user" do
      # Create an existing active token
      existing_token = create(:refresh_token, user: user, revoked_at: nil)
      
      token, new_refresh_token = described_class.create_for_user(user)
      
      expect(existing_token.reload.revoked_at).to be_present
      expect(new_refresh_token.id).not_to eq(existing_token.id)
    end

    it "returns the token and refresh token record" do
      token, refresh_token = described_class.create_for_user(user)
      
      expect(token).to eq(refresh_token.original_token)
      expect(refresh_token).to be_a(RefreshToken)
    end

    it "sets the token to expire in the configured number of days" do
      token, refresh_token = described_class.create_for_user(user)
      
      expected_expiry = 30.days.from_now
      expect(refresh_token.expires_at).to be_within(1.second).of(expected_expiry)
    end
  end

  describe ".validate_and_rotate" do
    let(:refresh_token) { create(:refresh_token, user: user) }
    let(:valid_token) { refresh_token.original_token }

    before do
      allow(Auth::JwtService).to receive(:encode_access_token).with(sub: user.id).and_return(
        { token: "new-access-token", exp: Time.current.to_i + 900 }
      )
    end

    it "successfully validates and rotates a valid token" do
      result = described_class.validate_and_rotate(valid_token)
      
      expect(result).to include(
        :access_token,
        :exp,
        :refresh_token,
        :user
      )
      expect(result[:access_token]).to eq("new-access-token")
    end

    it "revokes the old token" do
      described_class.validate_and_rotate(valid_token)
      
      expect(refresh_token.reload.revoked_at).to be_present
    end

    it "creates a new refresh token" do
      old_token_id = refresh_token.id
      
      result = described_class.validate_and_rotate(valid_token)
      
      expect(result[:refresh_token]).to be_present
      expect(result[:refresh_token]).not_to eq(valid_token)
    end

    context "with expired tokens" do
      before do
        refresh_token.update!(expires_at: 1.day.ago)
      end

      it "returns nil for expired tokens" do
        result = described_class.validate_and_rotate(valid_token)
        expect(result).to be_nil
      end
    end

    context "with revoked tokens" do
      before do
        refresh_token.update!(revoked_at: Time.current)
      end

      it "returns nil for revoked tokens" do
        result = described_class.validate_and_rotate(valid_token)
        expect(result).to be_nil
      end
    end

    context "with non-existent tokens" do
      it "returns nil for non-existent tokens" do
        result = described_class.validate_and_rotate("non-existent-token")
        expect(result).to be_nil
      end
    end
  end

  describe ".revoke_for_user" do
    let!(:active_token1) { create(:refresh_token, user: user, revoked_at: nil) }
    let!(:active_token2) { create(:refresh_token, user: user, revoked_at: nil) }
    let!(:already_revoked_token) { create(:refresh_token, user: user, revoked_at: 1.day.ago) }

    it "revokes all active tokens for the user" do
      described_class.revoke_for_user(user)
      
      expect(active_token1.reload.revoked_at).to be_present
      expect(active_token2.reload.revoked_at).to be_present
      # Use be_within for time comparison to avoid precision issues
      expect(already_revoked_token.reload.revoked_at).to be_within(1.second).of(1.day.ago)
    end
  end

  describe ".cleanup_expired" do
    let!(:expired_token) { create(:refresh_token, user: user, expires_at: 1.day.ago) }
    let!(:valid_token) { create(:refresh_token, user: user, expires_at: 1.day.from_now) }

    it "deletes expired tokens" do
      expect { described_class.cleanup_expired }.to change(RefreshToken, :count).by(-1)
      expect(RefreshToken.exists?(expired_token.id)).to be false
      expect(RefreshToken.exists?(valid_token.id)).to be true
    end
  end

  describe ".cleanup_revoked" do
    let!(:old_revoked_token) { create(:refresh_token, user: user, revoked_at: 31.days.ago) }
    let!(:recent_revoked_token) { create(:refresh_token, user: user, revoked_at: 15.days.ago) }
    let!(:active_token) { create(:refresh_token, user: user, revoked_at: nil) }

    it "deletes revoked tokens older than 30 days" do
      # Ensure both revoked_at and updated_at are old enough to trigger cleanup
      old_revoked_token.update_columns(
        revoked_at: 31.days.ago,
        updated_at: 31.days.ago
      )
      
      expect { described_class.cleanup_revoked }.to change(RefreshToken, :count).by(-1)
      expect(RefreshToken.exists?(old_revoked_token.id)).to be false
      expect(RefreshToken.exists?(recent_revoked_token.id)).to be true
      expect(RefreshToken.exists?(active_token.id)).to be true
    end

    it "keeps recently revoked tokens" do
      described_class.cleanup_revoked
      
      expect(RefreshToken.exists?(recent_revoked_token.id)).to be true
      expect(RefreshToken.exists?(active_token.id)).to be true
    end
  end
end
