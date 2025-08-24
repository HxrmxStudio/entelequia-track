class AuthController < ApplicationController
  skip_before_action :authenticate_user!, only: [:login, :register, :refresh, :logout, :session]

  def login
    if auth_params[:email].blank? || auth_params[:password].blank?
      render json: { error: "missing_parameters" }, status: :unprocessable_entity
      return
    end

    user = Auth::AuthService.authenticate_user(
      email: auth_params[:email], 
      password: auth_params[:password]
    )

    if user
      session_data = Auth::AuthService.create_user_session(
        user, 
        client: auth_params[:client], 
        device: auth_params[:device]
      )
      
      # Set refresh token cookie
      Rails.logger.info "Login successful for user #{user.email}, setting refresh token cookie for cross-site compatibility"
      Auth::TokenService.set_refresh_token_cookie(cookies, session_data[:refresh_token])
      Rails.logger.info "Login response will include Set-Cookie header for cross-site requests"
      
      render json: {
        access_token: session_data[:access_token],
        refresh_token: session_data[:refresh_token], # Include refresh token for SSR
        exp: session_data[:exp],
        token_type: "Bearer",
        user: session_data[:user]
      }
    else
      render json: { error: "Invalid credentials" }, status: :unauthorized
    end
  end

  def refresh
    Rails.logger.info "Refresh request received from #{request.remote_ip}"
    Rails.logger.info "Request headers: User-Agent=#{request.headers['User-Agent']}"
    Rails.logger.info "CORS Origin: #{request.headers['Origin']}"
    
    # Try to get refresh token from multiple sources for SSR compatibility
    refresh_token = Auth::TokenService.extract_refresh_token(request, cookies)

    # Additional fallback: check request body for refresh token
    if refresh_token.blank?
      refresh_token = auth_params[:refresh_token] || request.params[:refresh_token]
      Rails.logger.info "Refresh token extraction - Found in request body" if refresh_token.present?
    end

    if refresh_token.blank?
      Rails.logger.warn "Refresh failed - no token found in cookies, headers, or body"
      Rails.logger.warn "Request cookies available: #{cookies.to_h.keys.join(', ')}"
      Rails.logger.warn "Raw cookie header: #{request.headers['Cookie'].inspect}"
      render json: { error: "missing_refresh_token" }, status: :unauthorized
      return
    end

    session_data = Auth::AuthService.refresh_user_session(
      refresh_token,
      client: auth_params[:client],
      device: auth_params[:device]
    )

    if session_data
      # Set new refresh token cookie
      Rails.logger.info "Refresh successful, setting new refresh token cookie"
      Auth::TokenService.set_refresh_token_cookie(cookies, session_data[:refresh_token])
      Rails.logger.info "Refresh response will include updated Set-Cookie header"

      render json: {
        access_token: session_data[:access_token],
        refresh_token: session_data[:refresh_token], # Include for SSR
        exp: session_data[:exp],
        token_type: "Bearer",
        user: session_data[:user]
      }
    else
      render json: { error: "invalid_refresh_token" }, status: :unauthorized
    end
  end

  def logout
    refresh_token = Auth::TokenService.extract_refresh_token(request, cookies)
    
    if refresh_token.present?
      Auth::AuthService.revoke_user_session(refresh_token)
    end
    
    # Clear the refresh token cookie
    Auth::TokenService.clear_refresh_token_cookie(cookies)
    
    head :no_content
  end

  def register
    if auth_params[:email].blank? || auth_params[:password].blank?
      render json: { error: "missing_parameters" }, status: :unprocessable_entity
      return
    end

    normalized_email = Auth::AuthService.normalize_email(auth_params[:email])
    
    if User.exists?(email: normalized_email)
      render json: { error: "email_already_taken" }, status: :unprocessable_entity
      return
    end

    user = User.new(
      email: normalized_email,
      password: auth_params[:password],
      name: auth_params[:name]
    )

    if user.save
      session_data = Auth::AuthService.create_user_session(
        user, 
        client: auth_params[:client], 
        device: auth_params[:device]
      )
      
      # Set refresh token cookie
      Auth::TokenService.set_refresh_token_cookie(cookies, session_data[:refresh_token])
      
      render json: {
        access_token: session_data[:access_token],
        exp: session_data[:exp],
        token_type: "Bearer",
        user: session_data[:user]
      }, status: :created
    else
      render json: { 
        error: "validation_failed", 
        details: user.errors.full_messages 
      }, status: :unprocessable_entity
    end
  end

  def session
    refresh_token = Auth::TokenService.extract_refresh_token(request, cookies)
    
    if refresh_token.blank?
      render json: { error: "no_session" }, status: :unauthorized
      return
    end

    # Try to get user from refresh token
    refresh_token_record = RefreshToken.find_by_token(refresh_token)
    if refresh_token_record&.active?
      user = refresh_token_record.user
      render json: {
        user: UserSerializer.new(user).as_json
      }
    else
      render json: { error: "invalid_session" }, status: :unauthorized
    end
  end

  private

  def auth_params
    # Handle both flat and nested parameter structures
    # This eliminates the "Unpermitted parameter: :auth" warnings
    if params[:auth].present?
      # If nested structure exists, use it
      params.require(:auth).permit(:email, :password, :name, :client, :device)
    else
      # Otherwise use flat structure (current behavior)
      params.permit(:email, :password, :name, :client, :device)
    end
  end
end
  