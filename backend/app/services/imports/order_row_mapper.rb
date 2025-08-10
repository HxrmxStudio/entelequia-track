module Imports
    class OrderRowMapper
      DELIVERY_MAP = {
        "correo" => "courier",
        "ship" => "courier",
        "delivery" => "courier",
        "envío" => "courier",
        "envio" => "courier",
        "retira" => "pickup",
        "pickup" => "pickup"
      }.freeze

      STATUS_MAP = {
        "" => "received",
        "recibido" => "received",
        "nuevo" => "received",
        "new" => "received",
        "preparando" => "preparing",
        "preparando_envio" => "preparing",
        "listo" => "ready_for_dispatch",
        "despacho" => "ready_for_dispatch",
        "ready" => "ready_for_dispatch",
        "cancelado" => "canceled",
        "cancelada" => "canceled"
      }.freeze
      # format: :csv_exact or :csv_normalized
      def initialize(format:)
        @format = format.to_sym
      end
  
      def call(row)
        case @format
        when :csv_exact
          {
            external_ref: row["Pedido #"]&.to_s&.strip,
            customer_name: row["Cliente"]&.to_s&.strip,
            order_date: parse_date(row["Fecha"]),
            amount_cents: parse_amount(row["Monto"]),
            delivery_method: map_delivery(row["Entrega"]),
            status: map_status(row["Estado"]),
          }
        when :csv_normalized
          {
            external_ref: row["order_id"]&.to_s&.strip,
            customer_name: row["customer_name"],
            order_date: parse_date(row["order_date"]),
            amount_cents: parse_amount(row["amount"]),
            delivery_method: map_delivery(row["delivery_method"]),
            status: map_status(row["status"]),
            # opcionales:
            phone: row["phone"],
            email: row["email"],
            address_line: row["address_line"],
            city: row["city"],
            province_state: row["province_state"],
            postal_code: row["postal_code"],
            notes: row["notes"],
            external_channel: row["external_channel"],
            payment_status: row["payment_status"]
          }
        else
          raise "Unknown format: #{@format}"
        end
      end
  
      private
  
      def parse_date(v)
        return nil if v.nil?
        v = v.to_s.strip
        # admite DD/MM/YYYY o YYYY-MM-DD
        if v.include?("/")
          d, m, y = v.split("/")
          Date.new(y.to_i, m.to_i, d.to_i).to_s
        else
          Date.parse(v).to_s
        end
      rescue
        nil
      end
  
      def parse_amount(v)
        return 0 if v.nil?
        s = v.to_s.strip.gsub(".", "").gsub(",", ".")
        (Float(s) * 100).round
      rescue
        0
      end
  
      def map_delivery(v)
        DELIVERY_MAP.fetch(v.to_s.downcase, "courier")
      end
  
      def map_status(v)
        STATUS_MAP.fetch(v.to_s.downcase, "received")
      end
    end
  end
  