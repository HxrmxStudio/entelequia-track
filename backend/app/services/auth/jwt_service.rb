module Auth
  class JwtService
    class << self
      def access_token_ttl_seconds
        ENV.fetch("ACCESS_TOKEN_TTL_SECONDS", "900").to_i
      end

      def secret
        ENV["JWT_SECRET"] || Rails.application.credentials.jwt_secret || "PutoElQueLoLee"
      end

      def algorithm
        "HS256"
      end

      def encode_access_token(sub:)
        issued_at = Time.now.to_i
        expires_at = issued_at + access_token_ttl_seconds
        payload = { 
          sub: sub, 
          iat: issued_at, 
          exp: expires_at,
          type: "access"
        }
        token = JWT.encode(payload, secret, algorithm)
        { token: token, exp: expires_at }
      end

      def decode_token(token)
        JWT.decode(token, secret, true, algorithm: algorithm)
      rescue JWT::DecodeError, JWT::ExpiredSignature => e
        nil
      end

      # Legacy method for backward compatibility
      def ttl_seconds
        access_token_ttl_seconds
      end

      def encode(sub:)
        encode_access_token(sub: sub)
      end
    end
  end
end


