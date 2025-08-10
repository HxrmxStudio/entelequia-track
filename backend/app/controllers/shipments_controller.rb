class ShipmentsController < ApplicationController
    before_action :authenticate_user!
  
    def index
      render json: Shipment.order(created_at: :desc).limit(100)
    end
  
  def show
    s = Shipment.find(params[:id])
    render json: ShipmentSerializer.new(s).as_json
  end
  
    def create
      s = Shipment.create!(shipment_params)
      render json: s, status: :created
    end
  
    def update
      s = Shipment.find(params[:id])
      s.update!(shipment_params)
      render json: s
    end
  
    def assign
      s = Shipment.find(params[:id])
      s.update!(assigned_courier_id: params[:courier_id])
      render json: s
    end
  
    def otp
      s = Shipment.find(params[:id])
      s.update!(qr_token: SecureRandom.uuid) # placeholder; OTP hash en Sprint 3
      render json: { qr_token: s.qr_token }
    end
  
    private
  
    def shipment_params
      params.permit(:order_id, :status, :assigned_courier_id, :delivery_method, :eta)
    end
  end
  