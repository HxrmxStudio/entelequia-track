module AuthHelpers
  def auth_header_for(user)
    payload = { sub: user.id, role: user.role, iat: Time.now.to_i, exp: 1.hour.from_now.to_i }
    token = JWT.encode(payload, ENV.fetch("JWT_SECRET", "dev-secret-change-me"), "HS256")
    { "Authorization" => "Bearer #{token}" }
  end
end
