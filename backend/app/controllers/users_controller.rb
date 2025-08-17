class UsersController < ApplicationController
  before_action :set_user, only: [:show, :update, :destroy]
  
  def index
    users = User.all
    
    # Apply filters if provided
    users = users.where("email ILIKE ?", "%#{params[:query]}%") if params[:query].present?
    users = users.where(role: params[:role]) if params[:role].present?
    users = users.where(active: params[:active]) if params[:active].present?
    
    render json: users.map { |user| UserSerializer.new(user).as_json }
  end

  def show
    render json: UserSerializer.new(@user).as_json
  end

  def create
    user = User.new(user_params)
    
    if user.save
      render json: UserSerializer.new(user).as_json, status: :created
    else
      render json: { 
        error: "validation_failed", 
        details: user.errors.full_messages 
      }, status: :unprocessable_entity
    end
  end

  def update
    if @user.update(user_params)
      render json: UserSerializer.new(@user).as_json
    else
      render json: { 
        error: "validation_failed", 
        details: @user.errors.full_messages 
      }, status: :unprocessable_entity
    end
  end

  def destroy
    @user.destroy
    head :no_content
  end

  private

  def set_user
    @user = User.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "user_not_found" }, status: :not_found
  end

  def user_params
    params.require(:user).permit(:email, :password, :name, :role, :active)
  end
end