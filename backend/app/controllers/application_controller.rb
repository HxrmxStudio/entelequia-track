class ApplicationController < ActionController::API
    before_action :set_current_user
  
    private
  
    def set_current_user
      auth = request.headers["Authorization"].to_s
      token = auth.split(" ").last
      return unless token.present?
  
      payload = JWT.decode(token, jwt_secret, true, algorithm: "HS256").first rescue nil
      @current_user = User.find_by(id: payload["sub"]) if payload
    end
  
    def authenticate_user!
      render json: { error: "unauthorized" }, status: :unauthorized unless @current_user
    end
  
    def require_role!(*roles)
      unless @current_user && roles.include?(@current_user.role)
        render json: { error: "forbidden" }, status: :forbidden
      end
    end
  
    def jwt_secret
      ENV.fetch("JWT_SECRET") { "dev-secret-change-me" }
    end
  
    def issue_token_for(user)
      payload = { sub: user.id, role: user.role, iat: Time.now.to_i, exp: 24.hours.from_now.to_i }
      JWT.encode(payload, jwt_secret, "HS256")
    end
  end
  