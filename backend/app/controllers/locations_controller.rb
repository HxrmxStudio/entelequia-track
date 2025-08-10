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
  
      # (Opcional) Publicar a SSE/WebSocket aquí
      RealtimeBus.publish("courier.location", { courier_id:, ts:, lat:, lon: })
  
      render json: { ok: true }, status: :created
    rescue ActionController::ParameterMissing
      render json: { error: "bad_request" }, status: :bad_request
    end
  end
  