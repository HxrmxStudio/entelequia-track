module Auth
  class TokenService
    class << self
      def extract_refresh_token(request, cookies)
        # Try to get from cookie first (panel)
        cookie_token = cookies.encrypted[:rt]
        return cookie_token if cookie_token.present?
        
        # Fallback to Authorization header (mobile app)
        auth_header = request.headers["Authorization"].to_s
        if auth_header.start_with?("Bearer ")
          auth_header.split(" ").last
        end
      end

      def set_refresh_token_cookie(cookies, token)
        cookies.encrypted[:rt] = {
          value: token,
          httponly: true,
          secure: Rails.env.production?,
          same_site: :lax,
          path: "/",
          expires: ENV.fetch("REFRESH_TOKEN_TTL_DAYS", "30").to_i.days.from_now
        }
      end

      def clear_refresh_token_cookie(cookies)
        cookies.delete :rt, path: "/"
      end

      def validate_access_token(token)
        return nil unless token.present?

        begin
          payload = Auth::JwtService.decode_token(token)
          return nil unless payload
          
          # JWT.decode returns [payload, header], so we need payload[0]
          # Verify this is an access token
          return nil unless payload[0]["type"] == "access"
          
          payload[0]
        rescue JWT::DecodeError, JWT::ExpiredSignature
          nil
        end
      end
    end
  end
end
