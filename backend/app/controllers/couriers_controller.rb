class CouriersController < ApplicationController
    before_action :authenticate_user!
    before_action -> { require_role!("admin", "ops") }
    before_action :set_courier, only: [:show, :update, :destroy]
  
    # GET /couriers?query=ana&active=true
    def index
      scope = Courier.order(:name)
      scope = scope.where(active: ActiveModel::Type::Boolean.new.cast(params[:active])) if params.key?(:active)
      if params[:query].present?
        q = "%#{params[:query].strip.downcase}%"
        scope = scope.where("LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ?", q, q, q)
      end
      render json: scope.map { |c| serialize(c) }
    end
  
    # GET /couriers/:id
    def show
      render json: serialize(@courier)
    end
  
    # POST /couriers
    def create
      c = Courier.new(courier_params)
      if c.save
        render json: serialize(c), status: :created
      else
        render json: { errors: c.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    # PATCH /couriers/:id
    def update
      if @courier.update(courier_params)
        render json: serialize(@courier)
      else
        render json: { errors: @courier.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    # DELETE /couriers/:id
    def destroy
      @courier.destroy!
      head :no_content
    end
  
    private
  
    def set_courier
      @courier = Courier.find(params[:id])
    end
  
    def courier_params
      params.require(:courier).permit(:name, :email, :phone, :active, :vehicle, :notes)
    end
  
    def serialize(c)
      {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        active: c.active,
        vehicle: c.vehicle,
        notes: c.notes
      }
    end
  end
  