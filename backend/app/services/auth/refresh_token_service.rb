module Auth
  class RefreshTokenService
    class << self
      def create_for_user(user, client: nil, device: nil)
        # Revoke any existing active tokens for this user
        user.refresh_tokens.active.update_all(revoked_at: Time.current)
        
        # Create new refresh token
        refresh_token = RefreshToken.create_for_user(user, client: client, device: device)
        
        # Return both the token and the refresh token record
        [refresh_token.original_token, refresh_token]
      end

      def validate_and_rotate(token, client: nil, device: nil)
        Rails.logger.info "RefreshTokenService: Starting validation for token: #{token&.first(20)}..."
        
        refresh_token = RefreshToken.find_by_token(token)
        Rails.logger.info "RefreshTokenService: Token lookup result: #{refresh_token ? 'Found' : 'Not found'}"
        
        if refresh_token
          Rails.logger.info "RefreshTokenService: Token active? #{refresh_token.active?}"
          Rails.logger.info "RefreshTokenService: Token expired? #{refresh_token.expired?}"
          Rails.logger.info "RefreshTokenService: Token revoked? #{refresh_token.revoked?}"
          Rails.logger.info "RefreshTokenService: Token expires at: #{refresh_token.expires_at}"
        end
        
        return nil unless refresh_token&.active?

        user = refresh_token.user
        Rails.logger.info "RefreshTokenService: Found user: #{user.email}"
        
        # Use transaction to ensure atomicity and prevent race conditions
        ActiveRecord::Base.transaction do
          # Create new refresh token FIRST (before revoking the old one)
          new_token, new_refresh_token = create_for_user(user, client: client, device: device)
          Rails.logger.info "RefreshTokenService: New token created"
          
          # Only revoke the old token AFTER successfully creating the new one
          refresh_token.revoke!
          Rails.logger.info "RefreshTokenService: Current token revoked"
          
          # Generate new access token
          access_token_data = Auth::JwtService.encode_access_token(sub: user.id)
          Rails.logger.info "RefreshTokenService: New access token generated"
          
          {
            access_token: access_token_data[:token],
            exp: access_token_data[:exp],
            refresh_token: new_token,
            user: UserSerializer.new(user).as_json
          }
        end
      rescue => e
        Rails.logger.error "RefreshTokenService: Error during token rotation: #{e.message}"
        Rails.logger.error "RefreshTokenService: Backtrace: #{e.backtrace.first(5).join("\n")}"
        nil
      end

      def revoke_for_user(user)
        user.refresh_tokens.active.update_all(revoked_at: Time.current)
      end

      def cleanup_expired
        RefreshToken.expired.delete_all
      end

      def cleanup_revoked
        RefreshToken.revoked.where("updated_at < ?", 30.days.ago).delete_all
      end
    end
  end
end
