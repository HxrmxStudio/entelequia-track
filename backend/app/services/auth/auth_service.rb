module Auth
  class AuthService
    class << self
      def authenticate_user(email:, password:)
        normalized_email = normalize_email(email)
        return nil unless normalized_email.present? && password.present?

        user = User.find_by(email: normalized_email)
        return nil unless user&.authenticate(password)

        user
      end

      def create_user_session(user, client: nil, device: nil)
        # Generate access token
        access_token_data = Auth::JwtService.encode_access_token(sub: user.id)
        
        # Generate refresh token
        refresh_token, refresh_token_record = Auth::RefreshTokenService.create_for_user(
          user, 
          client: client, 
          device: device
        )
        
        {
          access_token: access_token_data[:token],
          exp: access_token_data[:exp],
          refresh_token: refresh_token,
          user: UserSerializer.new(user).as_json
        }
      end

      def refresh_user_session(refresh_token, client: nil, device: nil)
        Auth::RefreshTokenService.validate_and_rotate(
          refresh_token, 
          client: client, 
          device: device
        )
      end

      def revoke_user_session(refresh_token)
        return unless refresh_token

        refresh_token_record = RefreshToken.find_by_token(refresh_token)
        refresh_token_record&.revoke!
      end

      def normalize_email(email)
        return nil unless email.is_a?(String)
        normalized = email.strip.downcase
        normalized.empty? ? nil : normalized
      end
    end
  end
end
