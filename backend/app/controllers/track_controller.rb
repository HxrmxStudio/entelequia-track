module Public
    class TrackController < ApplicationController
      # No auth
      def show
        s = Shipment.find_by!(qr_token: params[:code].to_s)
        # Courier last ping (opcional)
        last_loc = Location.where(courier_id: s.assigned_courier_id).order(recorded_at: :desc).limit(1).first
        render json: {
          shipment: {
            id: s.id,
            status: s.status,
            eta: s.eta,
            order_id: s.order_id
          },
          destination: address_json(s.order&.address),
          courier_last: last_loc && loc_json(last_loc)
        }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "not_found" }, status: :not_found
      end
  
      private
  
      def address_json(a)
        return nil unless a
        latlon = a.geom ? RGeo::Geographic.spherical_factory(srid:4326).parse_wkt(a.geom.as_text) : nil
        { line1: a.line1, city: a.city, province: a.province_state,
          postal_code: a.postal_code,
          lat: latlon&.y, lon: latlon&.x }
      end
  
      def loc_json(l)
        pt = RGeo::Geographic.spherical_factory(srid:4326).parse_wkt(l.geom.as_text)
        { lat: pt.y, lon: pt.x, recorded_at: l.recorded_at }
      end
    end
  end
  