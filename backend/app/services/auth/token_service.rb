module Auth
  class TokenService
    class << self
      def extract_refresh_token(request, cookies)
        # Try to get from cookie first (panel)
        cookie_token = cookies.encrypted[:rt]
        Rails.logger.info "Refresh token extraction - Cookie token present: #{cookie_token.present?}"

        if cookie_token.present?
          Rails.logger.info "Refresh token extraction - Found in cookie"
          return cookie_token
        end

        # Fallback to Authorization header (mobile app)
        auth_header = request.headers["Authorization"].to_s
        Rails.logger.info "Refresh token extraction - Auth header present: #{auth_header.present?}"

        if auth_header.start_with?("Bearer ")
          token = auth_header.split(" ").last
          Rails.logger.info "Refresh token extraction - Found in header"
          return token
        end

        # Additional fallback: check for token in request parameters
        # This can help with frontend issues where cookies aren't working
        param_token = request.params[:refresh_token] || request.params.dig(:auth, :refresh_token)
        if param_token.present?
          Rails.logger.info "Refresh token extraction - Found in parameters"
          return param_token
        end

        Rails.logger.info "Refresh token extraction - No token found anywhere"
        nil
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
