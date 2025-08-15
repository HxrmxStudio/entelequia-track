class ApplicationController < ActionController::API
  include ActionController::Cookies
  
  before_action :set_current_user
  before_action :authenticate_user!

  private

  def set_current_user
    auth_header = request.headers["Authorization"]
    return unless auth_header&.start_with?("Bearer ")

    token = auth_header.split(" ").last
    payload = Auth::TokenService.validate_access_token(token)
    return unless payload

    user_id = payload["sub"]
    @current_user = User.find_by(id: user_id)
  end

  def authenticate_user!
    unless @current_user
      render json: { error: "unauthorized" }, status: :unauthorized
    end
  end

  def require_role!(*roles)
    authenticate_user!
    return if @current_user && roles.include?(@current_user.role.to_sym)
    
    render json: { error: "forbidden" }, status: :forbidden
  end
end
  