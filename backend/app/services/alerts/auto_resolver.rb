module Alerts
  class AutoResolver
    class << self
      def resolve_gps_offline_for_courier(courier_id, note: "auto")
        Alert.open.where(code: "gps_offline", courier_id: courier_id).find_each do |a|
          a.resolve!(note: note)
          RealtimeBus.publish("alert.resolved", { id: a.id, type: a.code, resolved_at: Time.current.iso8601 })
        end
      end

      def resolve_shipment_delay(shipment_id, note: "Shipment delivered")
        Alert.open.where(code: ["shipment_delayed", "eta_delay"], shipment_id: shipment_id).find_each do |a|
          a.resolve!(note: note)
          RealtimeBus.publish("alert.resolved", { id: a.id, type: a.code, resolved_at: Time.current.iso8601 })
        end
      end
    end
  end
end


