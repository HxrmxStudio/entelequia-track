module JwtService
  module_function

  def ttl_seconds
    ENV.fetch("JWT_TTL", "86400").to_i
  end

  def secret
    ENV.fetch("JWT_SECRET") { Rails.application.credentials.jwt_secret || "PutoElQueLoLee" }
  end

  def algorithm
    "HS256"
  end

  def encode(sub:)
    issued_at = Time.now.to_i
    expires_at = issued_at + ttl_seconds
    payload = { sub: sub, iat: issued_at, exp: expires_at }
    token = JWT.encode(payload, secret, algorithm)
    { token: token, exp: expires_at }
  end
end


