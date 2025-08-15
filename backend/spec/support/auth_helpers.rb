module AuthHelpers
  def auth_header_for(user)
    token_data = Auth::JwtService.encode_access_token(sub: user.id)
    { "Authorization" => "Bearer #{token_data[:token]}" }
  end
end
