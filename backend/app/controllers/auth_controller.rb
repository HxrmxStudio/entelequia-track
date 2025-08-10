class AuthController < ApplicationController
    def login
      user = User.find_by(email: params[:email])
      if user&.authenticate(params[:password])
        render json: { token: issue_token_for(user), role: user.role }
      else
        render json: { error: "invalid_credentials" }, status: :unauthorized
      end
    end
  end
  