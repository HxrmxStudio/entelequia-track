module Api
  module V1
    class ProofsController < ApplicationController
      before_action :authenticate_user!, except: []

      # POST /api/v1/proofs/presign
      # { filename, content_type }
      def presign
        filename = params.require(:filename)
        content_type = params.require(:content_type)
        key = generate_key(filename)
        presigned = SupabaseStorage.create_signed_upload(key, content_type: content_type)
        render json: presigned.merge(key: key)
      end

      # POST /api/v1/proofs
      # { shipment_id, otp?, lat?, lon?, key }
      def create
        s = Shipment.find(params.require(:shipment_id))
        method = (params[:otp].present? ? "otp" : "photo")
        lat = params[:lat]&.to_f
        lon = params[:lon]&.to_f
        otp = params[:otp].to_s.strip

        # Role-based source and validations
        user_role = @current_user&.role.to_s
        source = %w[admin ops].include?(user_role) ? "panel_manual" : "courier_app"

        if method == "otp"
          return render(json: { error: "otp_required" }, status: :unprocessable_entity) if otp.blank?
          return render(json: { error: "otp_locked" }, status: :locked) if OtpService.locked?(s)
          begin
            ok = OtpService.verify!(s, otp)
          rescue => e
            return render(json: { error: "otp_expired" }, status: :unprocessable_entity) if e.message == "expired"
            raise
          end
          return render(json: { error: "otp_invalid" }, status: :unprocessable_entity) unless ok
        end

        # Geofence only enforced for courier_app
        warning = nil
        if source == "courier_app"
          return render(json: { error: "Geostamp is required (lat, lon)" }, status: :unprocessable_entity) if lat.nil? || lon.nil?
          geo = GeofenceService.check!(shipment: s, lat: lat, lon: lon)
          unless geo.inside
            return render(json: { error: "Outside delivery radius", distance_m: geo.distance_m, radius_m: geo.radius_m }, status: :unprocessable_entity)
          end
        else
          warning = "Ubicación ingresada manualmente por operador" if lat && lon
        end

        key = params.require(:key)

        p = Proof.new(
          shipment_id: s.id,
          method: method,
          geom: (lat && lon) ? "POINT(#{lon} #{lat})" : nil,
          captured_at: Time.current,
          device_hash: request.user_agent.to_s[0,120],
          photo_url: nil,
          photo_key: key,
          metadata: { "source" => source }.tap { |h| h["warning"] = warning if warning }
        )
        p.storage_provider = "supabase"
        unless p.save
          return render json: { error: "validation_failed", details: p.errors.full_messages }, status: :unprocessable_entity
        end

        s.update!(status: "delivered", eta: nil) if %w[otp photo qr].include?(method)

        Event.create!(
          type_key: "pod.created",
          subject_id: s.id,
          actor_kind: @current_user.role,
          actor_id: @current_user.id,
          payload: { method:, photo_key: key, lat:, lon: },
          occurred_at: Time.current
        )
        RealtimeBus.publish("shipment.updated", { id: s.id, status: s.status })

        render json: { ok: true, proof_id: p.id, key: key, warning: warning }.compact, status: :created
      rescue ActiveRecord::RecordNotFound
        render json: { error: "shipment_not_found" }, status: :not_found
      rescue => e
        Rails.logger.error("proofs#create supabase error: #{e.class}: #{e.message}")
        render json: { error: "proof_creation_failed" }, status: :unprocessable_entity
      end

      # GET /api/v1/proofs/:id/signed_url
      def signed_url
        p = Proof.find(params[:id])
        key = p.photo_key.presence || p.photo_url
        raise ActiveRecord::RecordNotFound if key.blank?
        url = SupabaseStorage.create_signed_download(key)[:url]
        render json: { url: url }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "not_found" }, status: :not_found
      rescue => e
        Rails.logger.error("proofs#signed_url error: #{e.class}: #{e.message}")
        render json: { error: "signed_url_failed" }, status: :unprocessable_entity
      end

      private

      def generate_key(filename)
        ext = File.extname(filename).presence || ".jpg"
        date_path = Time.zone.now.strftime("%Y/%m/%d")
        "proofs/#{date_path}/#{SecureRandom.uuid}#{ext}"
      end
    end
  end
end


