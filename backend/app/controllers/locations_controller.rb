class LocationsController < ApplicationController
    before_action :authenticate_user!
  
    def create
      # Idempotencia por (courier_id, ts)
      courier_id = params.require(:courier_id)
      ts = Time.parse(params.require(:ts))
      lat = params.require(:lat).to_f
      lon = params.require(:lon).to_f
  
      loc = Location.find_by(courier_id: courier_id, recorded_at: ts)
      if loc
        return render json: { ok: true, duplicate: true }, status: :ok
      end
  
      loc = Location.new(
        courier_id: courier_id,
        recorded_at: ts,
        geom: "POINT(#{lon} #{lat})",
        accuracy_m: params[:accuracy],
        speed_mps: params[:speed],
        battery_pct: params[:battery],
        app_version: params[:app_version]
      )
    loc.save!
  
    # Publish realtime and auto-resolve gps_offline alert if exists
    RealtimeBus.publish("courier.location", { courier_id:, ts:, lat:, lon: })
    Alerts::AutoResolver.resolve_gps_offline_for_courier(courier_id)

    # Public live location for all active shipments of this courier (by public code)
    Shipment.where(assigned_courier_id: courier_id)
            .where.not(status: ["delivered", "canceled"]) 
            .find_each do |s|
      RealtimePublisher.public_location_ping(shipment: s, location: loc)
    end
    # Auto-resolve handled by Alerts::AutoResolver
  
      render json: { ok: true }, status: :created
    rescue ActionController::ParameterMissing
      render json: { error: "bad_request" }, status: :bad_request
    end
  end
  