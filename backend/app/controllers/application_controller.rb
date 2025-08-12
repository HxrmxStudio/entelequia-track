class ApplicationController < ActionController::API
  before_action :set_current_user

  private

  def set_current_user
    authorization_header = request.headers["Authorization"].to_s
    token = authorization_header.split(" ").last
    return unless token.present?

    begin
      payload, = JWT.decode(token, JwtService.secret, true, algorithm: JwtService.algorithm)
      @current_user = User.find_by(id: payload["sub"]) if payload
    rescue JWT::DecodeError, JWT::ExpiredSignature
      @current_user = nil
    end
  end

  def authenticate_user!
    render json: { error: "unauthorized" }, status: :unauthorized unless @current_user
  end

  def require_role!(*roles)
    unless @current_user && roles.include?(@current_user.role)
      render json: { error: "forbidden" }, status: :forbidden
    end
  end
end
  