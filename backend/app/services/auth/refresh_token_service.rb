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
        refresh_token = RefreshToken.find_by_token(token)
        return nil unless refresh_token&.active?

        user = refresh_token.user
        
        # Revoke the current token
        refresh_token.revoke!
        
        # Create new refresh token
        new_token, new_refresh_token = create_for_user(user, client: client, device: device)
        
        # Generate new access token
        access_token_data = Auth::JwtService.encode_access_token(sub: user.id)
        
        {
          access_token: access_token_data[:token],
          exp: access_token_data[:exp],
          refresh_token: new_token,
          user: UserSerializer.new(user).as_json
        }
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
