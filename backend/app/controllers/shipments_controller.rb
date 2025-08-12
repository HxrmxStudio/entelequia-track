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
      begin
        code = OtpService.generate!(s)
        # TODO: Notify customer via SMS/Email with `code` (do not return via API)
        Rails.logger.info("OTP generated for shipment=#{s.id}")
        render json: { ok: true }, status: :ok
      rescue => e
        case e.message
        when "locked"
          render json: { error: "otp_locked" }, status: :locked
        when "throttled"
          render json: { error: "otp_throttled" }, status: :too_many_requests
        else
          render json: { error: "otp_generation_failed" }, status: :unprocessable_entity
        end
      end
    end
  
    private
  
    def shipment_params
      params.permit(:order_id, :status, :assigned_courier_id, :delivery_method, :eta)
    end
  end
  