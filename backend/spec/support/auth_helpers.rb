module AuthHelpers
  def auth_header_for(user)
    token_data = JwtService.encode(sub: user.id)
    { "Authorization" => "Bearer #{token_data[:token]}" }
  end
end
