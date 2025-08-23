module Imports
  class OrderRowMapper
    # Comprehensive mapping for delivery types to channels
    DELIVERY_TO_CHANNEL_MAP = {
      # Moto delivery
      "envío - moto" => "moto",
      "envio - moto" => "moto",
      "moto" => "moto",
      "moto caba" => "moto",
      "envío moto" => "moto",
      
      # Mail delivery
      "envío - correo" => "correo",
      "envio - correo" => "correo",
      "correo" => "correo",
      "correo - retiro en sucursal" => "correo_sucursal",
      "envío - sucursal correo" => "correo_sucursal",
      "envio - sucursal correo" => "correo_sucursal",
      
      # Courier services
      "dhl" => "dhl",
      "envio - dhl" => "dhl",
      "envío - dhl" => "dhl",
      "envio express por dhl (hasta 4 diás hábiles)" => "dhl",
      "dhl express (entrega en 4 días hábiles)" => "dhl",
      "andreani" => "andreani",
      "andreani (hasta 10 días hábiles)" => "andreani",
      "correo andreani (hasta 10 diás hábiles de demora)" => "andreani",
      "urbano" => "urbano",
      "urbano (hasta 10 días hábiles)" => "urbano",
      "correo urbano (hasta 10 diás hábiles de demora)" => "urbano",
      "fast mail" => "fast_mail",
      "fastmail" => "fast_mail",
      "fast mail (96hs hábiles)" => "fast_mail",
      "fast mail (hasta 10 días hábiles)" => "fast_mail",
      
      # Marketplace
      "mercado envios - normal a domicilio" => "mercado_envios",
      "mercado envios" => "mercado_envios",
      
      # Digital
      "email" => "email",
      "envío - email" => "email",
      "envio - email" => "email",
      
      # Special services
      "envío en el día" => "mismo_dia",
      "envio en el dia" => "mismo_dia",
      "envío gratuito" => "gratuito",
      "envio gratuito" => "gratuito",
      "envío gratis" => "gratuito",
      "envio gratis" => "gratuito",
      "¡envío gratuito!" => "gratuito",
      "¡envio gratuito!" => "gratuito",
      "envío gratuito (en el día)" => "gratuito",
      "envio gratuito (en el dia)" => "gratuito",
      "¡envío gratuito! (en el día)" => "gratuito",
      "¡envio gratuito! (en el dia)" => "gratuito",
      "¡envío gratuito! (puede demorar hasta 10 días hábiles)" => "gratuito",
      "¡envio gratuito! (puede demorar hasta 10 dias hábiles)" => "gratuito",
      "¡envío gratuito! (72hs hàbiles)" => "gratuito",
      "¡envio gratuito! (72hs hábiles)" => "gratuito",
      "¡envío gratuito! (en 72hs hábiles)" => "gratuito",
      "¡envio gratuito! (en 72hs hábiles)" => "gratuito",
      
      # Pickup
      "retiro en sucursal" => "sucursal",
      "retiro en sucursal belgrano" => "sucursal_belgrano",
      "retiro en sucursal centro" => "sucursal_centro",
      "retiro por sucursal belgrano" => "sucursal_belgrano",
      "retiro por sucursal centro" => "sucursal_centro",
      "retirar por local belgrano" => "sucursal_belgrano",
      "retirar por local centro" => "sucursal_centro"
    }.freeze

    # Comprehensive mapping for delivery types to shipment delivery methods
    DELIVERY_TO_METHOD_MAP = {
      # Moto delivery
      "envío - moto" => "courier",
      "envio - moto" => "courier",
      "moto" => "courier",
      "moto caba" => "courier",
      "envío moto" => "courier",
      
      # Mail delivery
      "envío - correo" => "courier",
      "envio - correo" => "courier",
      "correo" => "courier",
      "correo - retiro en sucursal" => "courier",
      "envío - sucursal correo" => "courier",
      "envio - sucursal correo" => "courier",
      
      # Courier services
      "dhl" => "carrier",
      "envio - dhl" => "carrier",
      "envío - dhl" => "carrier",
      "envio express por dhl (hasta 4 diás hábiles)" => "carrier",
      "dhl express (entrega en 4 días hábiles)" => "carrier",
      "andreani" => "carrier",
      "andreani (hasta 10 días hábiles)" => "carrier",
      "correo andreani (hasta 10 diás hábiles de demora)" => "carrier",
      "urbano" => "courier",
      "urbano (hasta 10 días hábiles)" => "courier",
      "correo urbano (hasta 10 diás hábiles de demora)" => "courier",
      "fast mail" => "carrier",
      "fastmail" => "carrier",
      "fast mail (96hs hábiles)" => "carrier",
      "fast mail (hasta 10 días hábiles)" => "carrier",
      
      # Marketplace
      "mercado envios - normal a domicilio" => "courier",
      "mercado envios" => "courier",
      
      # Digital
      "email" => "other",
      "envío - email" => "other",
      "envio - email" => "other",
      
      # Special services
      "envío en el día" => "courier",
      "envio en el dia" => "courier",
      "envío gratuito" => "courier",
      "envio gratuito" => "courier",
      "envío gratis" => "courier",
      "envio gratis" => "courier",
      "¡envío gratuito!" => "courier",
      "¡envio gratuito!" => "courier",
      "envío gratuito (en el día)" => "courier",
      "envio gratuito (en el dia)" => "courier",
      "¡envío gratuito! (en el día)" => "courier",
      "¡envio gratuito! (en el dia)" => "courier",
      "¡envío gratuito! (puede demorar hasta 10 días hábiles)" => "courier",
      "¡envio gratuito! (puede demorar hasta 10 dias hábiles)" => "courier",
      "¡envío gratuito! (72hs hàbiles)" => "courier",
      "¡envio gratuito! (72hs hábiles)" => "courier",
      "¡envío gratuito! (en 72hs hábiles)" => "courier",
      "¡envio gratuito! (en 72hs hábiles)" => "courier",
      
      # Pickup
      "retiro en sucursal" => "pickup",
      "retiro en sucursal belgrano" => "pickup",
      "retiro en sucursal centro" => "pickup",
      "retiro por sucursal belgrano" => "pickup",
      "retiro por sucursal centro" => "pickup",
      "retirar por local belgrano" => "pickup",
      "retirar por local centro" => "pickup"
    }.freeze

    # Comprehensive mapping for statuses
    STATUS_MAP = {
      # Preparation states
      "en preparación" => "preparing",
      "en preparacion" => "preparing",
      "preparando" => "preparing",
      "preparando_envio" => "preparing",
      
      # Payment states
      "pendiente de pago" => "pending_payment",
      "pago fallido" => "payment_failed",
      "esperando aprobación de pago" => "payment_pending",
      "esperando aprobacion de pago" => "payment_pending",
      "esperando aprobación por pago con transferencia bancaria" => "payment_pending",
      
      # Ready states
      "listo para retirar" => "ready_for_pickup",
      "listo para entregar" => "ready_for_delivery",
      "listo" => "ready_for_dispatch",
      "despacho" => "ready_for_dispatch",
      "ready" => "ready_for_dispatch",
      
      # Active states
      "en camino" => "in_transit",
      "en espera" => "waiting",
      "procesando" => "processing",
      
      # Final states
      "completado" => "completed",
      "entregado" => "completed",
      "delivered" => "completed",
      
      # Cancellation states
      "cancelado" => "canceled",
      "cancelada" => "canceled",
      
      # Refund states
      "reembolsado" => "refunded",
      "refund" => "refunded",
      
      # Failure states
      "fallido" => "failed",
      "failed" => "failed",
      
      # Default states
      "" => "received",
      "recibido" => "received",
      "nuevo" => "received",
      "new" => "received"
    }.freeze

    def initialize(format:)
      @format = format.to_sym
    end

    def call(row)
      case @format
      when :exact
        exact_mapping(row)
      when :normalized
        normalized_mapping(row)
      else
        raise "Unsupported format: #{@format}. Use :exact or :normalized"
      end
    end

    private

    def parse_date(v)
      return nil if v.nil?
      date_str = v.to_s.strip
      Date.parse(date_str)
    rescue
      nil
    end

    def parse_amount(v)
      return 0 if v.nil?
      
      # Handle currency prefixes and clean the amount
      amount_str = v.to_s.strip
      
      # Remove currency prefixes (ARS, USD, etc.)
      amount_str = amount_str.gsub(/^[A-Z]{3}\s*/, "")
      
      # Remove any commas (thousands separators)
      amount_str = amount_str.gsub(",", "")
      
      # Parse as float and convert to cents
      # "177100.00" -> 177100.0 -> 17710000 cents
      (Float(amount_str) * 100).round
    rescue
      0
    end

    def map_delivery_to_channel(v)
      return "web" if v.nil?
      normalized = v.to_s.strip.downcase
      Rails.logger.info "Import: Mapping delivery '#{v}' to channel '#{normalized}' -> '#{DELIVERY_TO_CHANNEL_MAP.fetch(normalized, "web")}'"
      DELIVERY_TO_CHANNEL_MAP.fetch(normalized, "web")
    end

    def map_delivery_to_method(v)
      return "courier" if v.nil?
      normalized = v.to_s.strip.downcase
      Rails.logger.info "Import: Mapping delivery '#{v}' to method '#{normalized}' -> '#{DELIVERY_TO_METHOD_MAP.fetch(normalized, "courier")}'"
      DELIVERY_TO_METHOD_MAP.fetch(normalized, "courier")
    end

    def map_status(v)
      return "received" if v.nil?
      normalized = v.to_s.strip.downcase
      Rails.logger.info "Import: Mapping status '#{v}' to '#{normalized}' -> '#{STATUS_MAP.fetch(normalized, "received")}'"
      STATUS_MAP.fetch(normalized, "received")
    end

    def exact_mapping(row)
      {
        external_ref: row["Pedido #"]&.strip,
        customer_name: row["Cliente"]&.strip,
        date: parse_date(row["Fecha"]),
        amount_cents: parse_amount(row["Monto"]),
        channel: map_delivery_to_channel(row["Entrega"]),
        delivery_method: map_delivery_to_method(row["Entrega"]),
        status: map_status(row["Estado"])
      }
    end

    def normalized_mapping(row)
      {
        external_ref: row["external_ref"] || row["Pedido #"]&.strip,
        customer_name: row["customer_name"] || row["Cliente"]&.strip,
        date: parse_date(row["date"] || row["Fecha"]),
        amount_cents: parse_amount(row["amount_cents"] || row["Monto"]),
        channel: map_delivery_to_channel(row["channel"] || row["Entrega"]),
        delivery_method: map_delivery_to_method(row["delivery_method"] || row["Entrega"]),
        status: map_status(row["status"] || row["Estado"])
      }
    end
  end
end
  