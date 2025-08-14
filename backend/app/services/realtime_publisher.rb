class RealtimePublisher
  class << self
    def proof_created(shipment:, proof:)
      RealtimeBus.publish(
        "proof.created",
        {
          shipment_id: shipment.id,
          proof: {
            id: proof.id,
            kind: proof.method,
            lat: extract_lat(proof),
            lon: extract_lon(proof),
            taken_at: proof.captured_at&.iso8601
          },
          shipment: {
            status: shipment.status,
            delivered_at: extract_delivered_at(shipment)
          }
        }
      )
    end

    def shipment_updated(shipment:)
      RealtimeBus.publish("shipment.updated", { id: shipment.id, status: shipment.status })
    end

    private

    def extract_lat(proof)
      if proof.respond_to?(:lat) && proof.lat
        proof.lat
      elsif proof.respond_to?(:geom) && proof.geom.present?
        # Expecting "POINT(lon lat)" WKT format
        proof.geom.to_s.split.last.to_f rescue nil
      end
    end

    def extract_lon(proof)
      if proof.respond_to?(:lon) && proof.lon
        proof.lon
      elsif proof.respond_to?(:geom) && proof.geom.present?
        # Expecting "POINT(lon lat)" WKT format
        coords = proof.geom.to_s.gsub("POINT(", "").gsub(")", "").split(" ")
        coords[0].to_f rescue nil
      end
    end

    def extract_delivered_at(shipment)
      if shipment.respond_to?(:delivered_at)
        shipment.delivered_at&.iso8601
      end
    end
  end
end


