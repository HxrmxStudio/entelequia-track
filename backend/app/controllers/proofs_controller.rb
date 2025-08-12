require "digest"

module Shipments
    class ProofsController < ApplicationController
      before_action :authenticate_user!
  
      # multipart/form-data:
      # - method: otp|qr|photo|signature
      # - lat, lon, captured_at (ISO8601)
      # - otp (when method=otp) OR qr_payload (when method=qr)
      # - photo (file, optional) / signature_svg (text)
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
          return render(json: { error: "otp_required" }, status: :unprocessable_entity) if otp.blank?
          return render(json: { error: "otp_locked" }, status: :locked) if OtpService.locked?(s)
          begin
            ok = OtpService.verify!(s, otp)
          rescue => e
            return render(json: { error: "otp_expired" }, status: :unprocessable_entity) if e.message == "expired"
            raise
          end
          return render(json: { error: "otp_invalid" }, status: :unprocessable_entity) unless ok
        when "qr"
          payload = params[:qr_payload].to_s
          return render(json: { error: "qr_required" }, status: :unprocessable_entity) if payload.blank?
          # Validate by comparing with stored token
          return render(json: { error: "qr_mismatch" }, status: :unprocessable_entity) unless ActiveSupport::SecurityUtils.secure_compare(s.qr_token.to_s, payload)
        when "photo"
          # No special validation
        when "signature"
          p.signature_svg = params[:signature_svg].to_s
          return render(json: { error: "signature_required" }, status: :unprocessable_entity) if p.signature_svg.blank?
        else
          return render(json: { error: "invalid_method" }, status: :unprocessable_entity)
        end
  
        if params[:photo].present?
          url = PodUploader.new.upload!(params[:photo]) # stores in S3/MinIO
          p.photo_url = url
        end
  
        # Tamper-evident hash chain
        payload_for_hash = [s.id, method, ts.to_i, lat, lon, p.photo_url, p.signature_svg].join("|")
        p.hash_chain = Digest::SHA256.hexdigest(payload_for_hash)
  
        p.save!
  
        # Actualiza estado simplificado si method ∈ {otp,qr} y foto presente
        if %w[otp qr].include?(method)
          if lat && lon
            g = GeofenceService.check!(shipment: s, lat: lat, lon: lon)
            return render(json: { error: "outside_geofence", distance_m: g.distance_m, radius_m: g.radius_m }, status: :unprocessable_entity) unless g.inside
          end
          s.update!(status: "delivered", eta: nil)
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
  
        render json: { ok: true, proof_id: p.id, photo_url: p.photo_url }, status: :created
      rescue ActiveRecord::RecordNotFound
        render json: { error: "shipment_not_found" }, status: :not_found
      rescue => e
        Rails.logger.error("proofs#create error: #{e.class}: #{e.message}")
        render json: { error: "proof_creation_failed" }, status: :unprocessable_entity
      end
  
      private
  
      def current_device_hash
        request.user_agent.to_s[0,120]
      end
    end
  end

  # Adapter at top-level to satisfy routes autoload without moving files
  class ProofsController < Shipments::ProofsController; end
  