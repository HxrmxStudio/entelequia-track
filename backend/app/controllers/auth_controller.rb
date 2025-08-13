class AuthController < ApplicationController
  # CSRF is not applicable for stateless JSON login
  skip_before_action :verify_authenticity_token, only: :login if respond_to?(:verify_authenticity_token)

  def login
    email = normalized_email
    password = auth_params[:password]

    unless email.present? && password.present?
      render json: { error: "missing_parameters" }, status: :unprocessable_entity and return
    end

    user = User.find_by(email: email)

    if user&.authenticate(password)
      token_data = JwtService.encode(sub: user.id)
      render json: {
        token: token_data[:token],
        exp: token_data[:exp],
        token_type: "Bearer",
        user: { id: user.id, email: user.email }
      }
    else
      # TODO: hook rate limiter / lockout strategy
      render json: { error: "Invalid credentials" }, status: :unauthorized
    end
  end

  private

  def auth_params
    if params[:auth].is_a?(ActionController::Parameters)
      params.require(:auth).permit(:email, :password)
    else
      params.permit(:email, :password)
    end
  end

  def normalized_email
    raw = auth_params[:email]
    raw.is_a?(String) ? raw.strip.downcase : nil
  end
end
  