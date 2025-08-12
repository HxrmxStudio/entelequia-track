class ShipmentsController < ApplicationController
    before_action :authenticate_user!
    
    def index
      scope = Shipment.all

      # Enforce "my shipments" for courier role; only admins/ops may filter by arbitrary courier_id
      user_role = @current_user&.role.to_s
      case user_role
      when "courier"
        scope = scope.where(assigned_courier_id: @current_user.id)
      when "admin", "ops"
        scope = scope.where(assigned_courier_id: params[:courier_id]) if params[:courier_id].present?
      else
        # ignore courier_id for other roles
      end

      scope = scope.where(status: params[:status]) if params[:status].present?

      if params[:date].to_s == "today"
        scope = scope.where(created_at: Time.zone.today.all_day)
      end

      limit_param = params[:limit].presence&.to_i
      limit = if limit_param && limit_param > 0
        [limit_param, 500].min
      else
        200
      end
      offset_param = params[:offset].presence&.to_i
      offset = offset_param && offset_param > 0 ? offset_param : 0

      render json: scope.order(created_at: :desc).limit(limit).offset(offset)
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
  