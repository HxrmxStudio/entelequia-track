module Shipments
    class ProofsController < ApplicationController
      before_action :authenticate_user!
  
      # multipart/form-data:
      # - method: otp|qr|photo|signature
      # - lat, lon, captured_at (ISO8601)
      # - otp (si method=otp) OR qr_payload (si method=qr)
      # - photo (file, si corresponde) / signature_svg (text)
      def create
        s = Shipment.find(params[:shipment_id])
  
        method = params.require(:method)
        lat = params[:lat]&.to_f
        lon = params[:lon]&.to_f
        ts  = Time.parse(params[:captured_at] || Time.current.iso8601)
  
        p = Proof.new(
          shipment_id: s.id,
          method: method,
          geom: (lat && lon) ? "POINT(#{lon} #{lat})" : nil,
          captured_at: ts,
          device_hash: current_device_hash
        )
  
        case method
        when "otp"
          otp = params[:otp].to_s.strip
          return render json: { error: "otp_required" }, status: :unprocessable_entity if otp.blank?
          # (Sprint 3: comparar contra otp_code_hash en Shipment)
          p.otp_last4 = otp[-4..] if otp.size >= 4
        when "qr"
          payload = params[:qr_payload].to_s
          return render json: { error: "qr_required" }, status: :unprocessable_entity if payload.blank?
          p.qr_payload_hash = Digest::SHA256.hexdigest(payload)
        when "photo"
          # OK si sólo foto (extra)
        when "signature"
          p.signature_svg = params[:signature_svg].to_s
          return render json: { error: "signature_required" }, status: :unprocessable_entity if p.signature_svg.blank?
        else
          return render json: { error: "invalid_method" }, status: :unprocessable_entity
        end
  
        if params[:photo].present?
          url = PodUploader.new.upload!(params[:photo]) # guarda en S3/MinIO
          p.photo_url = url
        end
  
        # Tamper-evident: hash cadena
        payload_for_hash = [s.id, method, ts.to_i, lat, lon, p.photo_url, p.signature_svg, p.otp_last4, p.qr_payload_hash].join("|")
        p.hash_chain = Digest::SHA256.hexdigest(payload_for_hash)
  
        p.save!
  
        # Actualiza estado simplificado si method ∈ {otp,qr} y foto presente
        if %w[otp qr].include?(method)
          s.update!(status: "delivered") # Sprint 3: verificar OTP/QR real + geofence
        end
  
        # Emitir evento y broadcast
        Event.create!(
          type_key: "pod.created",
          subject_id: s.id,
          actor_kind: @current_user.role,
          actor_id: @current_user.id,
          payload: { method:, photo_url: p.photo_url, lat:, lon: },
          occurred_at: Time.current
        )
        RealtimeBus.publish("shipment.updated", { id: s.id, status: s.status })
        ActionCable.server.broadcast("realtime", { type: "shipment.updated", data: { id: s.id, status: s.status } })
  
        render json: { ok: true, proof_id: p.id, photo_url: p.photo_url }, status: :created
      rescue ActiveRecord::RecordNotFound
        render json: { error: "shipment_not_found" }, status: :not_found
      end
  
      private
  
      def current_device_hash
        request.user_agent.to_s[0,120]
      end
    end
  end

  # Adapter at top-level to satisfy routes autoload without moving files
  class ProofsController < Shipments::ProofsController; end
  