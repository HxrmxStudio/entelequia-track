class EntelequiaSeeder
  attr_reader :scale

  def initialize(scale = 1)
    @scale = [scale, 1].max # Minimum scale of 1
    setup_environment
  end

  def run!
    safety_check!
    setup_faker
    
    puts "🌱 Starting Entelequia-Track seeding (scale: #{scale})"
    puts "Environment: #{Rails.env}"
    puts "Database: #{Rails.configuration.database_configuration[Rails.env]['database']}"
    puts
    
    ActiveRecord::Base.transaction do
      disable_callbacks do
        seed_users_and_auth
        seed_customers_and_addresses  
        seed_couriers
        seed_orders_and_shipments
        seed_routes_and_stops
        seed_location_tracking
        seed_proofs_and_otp
        seed_alerts
        seed_events
      end
    end
    
    print_summary
    puts "✅ Seeding completed successfully!"
  end

  private

  def safety_check!
    unless Rails.env.development? || ENV["SEED_FORCE"]
      raise "🚫 Seeding is only allowed in development environment. Set SEED_FORCE=1 to override."
    end
  end

  def setup_environment
    # Set deterministic random seed for reproducible results
    srand(42)
    
    # Disable noisy logs during seeding
    ActiveRecord::Base.logger.level = Logger::WARN if Rails.env.development?
  end

  def setup_faker
    begin
      require "faker"
      Faker::Config.locale = "es"
      puts "📦 Using Faker gem for realistic data generation"
      @use_faker = true
    rescue LoadError
      puts "⚠️  Faker gem not available - using basic data generation"
      puts "   Run: bundle install to get realistic names and addresses"
      @use_faker = false
    end
  end

  def disable_callbacks
    # Disable background jobs and broadcasts during seeding
    old_cable = ActionCable.server.config.disable_request_forgery_protection rescue nil
    
    ActionCable.server.config.disable_request_forgery_protection = true if old_cable
    
    yield
  ensure
    ActionCable.server.config.disable_request_forgery_protection = old_cable if old_cable
  end

  def seed_users_and_auth
    puts "👥 Seeding users and authentication..."
    
    # Admin user
    User.find_or_create_by!(email: "admin@entelequia.local") do |u|
      u.password = "changeme123"
      u.role = "admin"
      u.name = "Administrador Sistema"
    end
    
    # Operations users
    (1..([2, scale].max)).each do |i|
      User.find_or_create_by!(email: "ops#{i}@entelequia.local") do |u|
        u.password = "changeme123"
        u.role = "ops"
        u.name = faker_name || "Operador #{i}"
      end
    end
    
    # Courier users
    (1..(3 * scale)).each do |i|
      User.find_or_create_by!(email: "courier#{i}@entelequia.local") do |u|
        u.password = "changeme123"
        u.role = "courier"
        u.name = faker_name || "Repartidor #{i}"
      end
    end
    
    puts "   ✓ Created users (admin: 1, ops: #{[2, scale].max}, couriers: #{3 * scale})"
  end

  def seed_customers_and_addresses
    puts "🏠 Seeding customers and addresses..."
    
    customer_count = 15 * scale
    address_count = 20 * scale
    
    # Create customers
    customer_count.times do |i|
      Customer.find_or_create_by!(name: faker_name || "Cliente #{i + 1}") do |c|
        c.phone = faker_phone
        c.email = faker_email("cliente#{i + 1}")
      end
    end
    
    # Buenos Aires locations for realistic addresses
    buenos_aires_areas = [
      { name: "Palermo", lat: -34.5755, lng: -58.4338 },
      { name: "Recoleta", lat: -34.5875, lng: -58.3974 },
      { name: "San Telmo", lat: -34.6118, lng: -58.3719 },
      { name: "Puerto Madero", lat: -34.6032, lng: -58.3636 },
      { name: "Belgrano", lat: -34.5627, lng: -58.4541 },
      { name: "Villa Crespo", lat: -34.5986, lng: -58.4394 },
      { name: "Caballito", lat: -34.6195, lng: -58.4317 },
      { name: "Flores", lat: -34.6280, lng: -58.4779 }
    ]
    
    address_count.times do |i|
      area = buenos_aires_areas.sample
      lat_offset = (rand - 0.5) * 0.02
      lng_offset = (rand - 0.5) * 0.02
      
      Address.find_or_create_by!(
        line1: faker_address || "#{area[:name]} #{100 + i}",
        city: area[:name],
        province_state: "CABA",
        country: "AR",
        postal_code: (1000 + rand(200)).to_s
      ) do |a|
        a.geom = "POINT(#{area[:lng] + lng_offset} #{area[:lat] + lat_offset})"
      end
    end
    
    puts "   ✓ Created #{Customer.count} customers and #{Address.count} addresses"
  end

  def seed_couriers
    puts "🚴 Seeding couriers..."
    
    courier_users = User.where(role: "courier").limit(3 * scale)
    vehicles = ["Motocicleta", "Bicicleta", "Auto", "Camioneta", "A pie"]
    
    courier_users.each_with_index do |user, i|
      code = "C-%03d" % (i + 1)
      
      Courier.find_or_create_by!(code: code) do |c|
        c.user = user
        c.name = user.name
        c.email = user.email
        c.phone = faker_phone
        c.vehicle = vehicles.sample
        c.active = rand < 0.9
        c.notes = rand < 0.3 ? "Repartidor confiable, conoce bien la zona." : nil
      end
    end
    
    puts "   ✓ Created #{Courier.count} couriers"
  end

  def seed_orders_and_shipments
    puts "📦 Seeding orders and shipments..."
    
    customers = Customer.all.to_a
    addresses = Address.all.to_a
    order_count = 25 * scale
    date_range = 37 # 30 days past + 7 days future
    
    order_count.times do |i|
      days_offset = (i.to_f / order_count * date_range) - 30
      created_time = days_offset.days.from_now.beginning_of_day + rand(16).hours
      
      external_ref = "ORD-#{Date.current.strftime('%Y%m')}-#{(i + 1).to_s.rjust(4, '0')}"
      
      order = Order.find_or_create_by!(external_ref: external_ref) do |o|
        o.customer = customers.sample
        o.address = addresses.sample
        o.channel = Order.channels.keys.sample
        o.amount_cents = (1000 + rand(50000))
        o.currency = "ARS"
        o.created_at = created_time
        o.updated_at = created_time
        
        # Set delivery window
        window_start = created_time + (4 + rand(8)).hours
        window_end = window_start + (2 + rand(6)).hours
        o.delivery_window = window_start..window_end
        
        # Set status based on order age
        if created_time < 2.days.ago
          o.status = Order.statuses.keys.sample
        elsif created_time < 1.day.ago
          o.status = ["ready_for_delivery", "in_transit", "completed"].sample
        else
          o.status = ["received", "preparing", "ready_for_delivery"].sample
        end
      end
      
      # Create shipment
      Shipment.find_or_create_by!(order: order) do |s|
        s.delivery_method = ["courier", "pickup"].sample
        s.created_at = order.created_at
        s.updated_at = order.updated_at
        
        s.status = case order.status
        when "completed" then "delivered"
        when "in_transit", "ready_for_delivery" then ["queued", "out_for_delivery"].sample
        when "canceled" then "canceled"
        when "failed" then "failed"
        else "queued"
        end
        
        if s.status.in?(["out_for_delivery", "delivered"])
          s.assigned_courier = Courier.where(active: true).sample
        end
        
        if s.status == "delivered"
          s.eta = order.created_at + (4 + rand(24)).hours
        elsif s.status == "out_for_delivery"
          s.eta = Time.current + rand(4).hours
        end
        
        s.sla_due_at = order.delivery_window&.end || (order.created_at + 24.hours)
        
        if s.status.in?(["out_for_delivery", "delivered"])
          s.qr_token = SecureRandom.uuid
          if rand < 0.6
            s.otp_code_hash = Digest::SHA256.hexdigest("1234")
            s.otp_generated_at = s.updated_at
            s.otp_expires_at = s.otp_generated_at + 4.hours
          end
        end
        
        s.geofence_radius_m = [50, 100, 150, 200].sample
      end
    end
    
    puts "   ✓ Created #{Order.count} orders and #{Shipment.count} shipments"
  end

  def seed_routes_and_stops
    puts "🗺️  Seeding routes and stops..."
    
    shipments = Shipment.includes(:order)
                        .where(status: ["queued", "out_for_delivery", "delivered"])
                        .where.not(assigned_courier: nil)
    
    shipments_by_courier_date = shipments.group_by do |s|
      [s.assigned_courier_id, s.created_at.to_date]
    end
    
    shipments_by_courier_date.each do |(courier_id, service_date), courier_shipments|
      next if courier_shipments.empty?
      
      courier = Courier.find(courier_id)
      
      route = Route.find_or_create_by!(
        courier: courier,
        service_date: service_date
      ) do |r|
        if service_date < Date.current
          r.status = "completed"
        elsif service_date == Date.current
          r.status = "in_progress"
        else
          r.status = "planned"
        end
      end
      
      courier_shipments.each_with_index do |shipment, sequence|
        Stop.find_or_create_by!(
          route: route,
          shipment: shipment,
          sequence: sequence
        ) do |stop|
          base_time = service_date.beginning_of_day + 8.hours + (sequence * 30).minutes
          stop.planned_at = base_time
          
          case route.status
          when "completed"
            stop.status = ["completed", "failed"].sample
            stop.arrived_at = base_time + rand(15).minutes
            if stop.status == "completed"
              stop.completed_at = stop.arrived_at + (5 + rand(15)).minutes
            end
          when "in_progress"
            if sequence < courier_shipments.size / 2
              stop.status = "completed"
              stop.arrived_at = base_time + rand(15).minutes
              stop.completed_at = stop.arrived_at + (5 + rand(15)).minutes
            elsif sequence == (courier_shipments.size / 2).floor
              stop.status = "arrived"
              stop.arrived_at = Time.current - rand(30).minutes
            else
              stop.status = "pending"
            end
          else
            stop.status = "pending"
          end
          
          if rand < 0.2
            stop.notes = {
              "delivery_notes" => ["Portero en planta baja", "Timbre roto, golpear puerta", "Oficina 5to piso"].sample
            }
          end
        end
      end
    end
    
    puts "   ✓ Created #{Route.count} routes and #{Stop.count} stops"
  end

  def seed_location_tracking
    puts "📍 Seeding location tracking data..."
    
    active_couriers = Courier.where(active: true)
    
    active_couriers.each do |courier|
      (0..2).each do |days_ago|
        date = days_ago.days.ago.to_date
        points_count = 20 + rand(30)
        
        base_lat = -34.6032 + (rand - 0.5) * 0.1
        base_lng = -58.3816 + (rand - 0.5) * 0.1
        
        points_count.times do |i|
          time_offset = (i.to_f / points_count) * 10.hours
          recorded_time = date.beginning_of_day + 8.hours + time_offset
          
          lat_drift = (rand - 0.5) * 0.01
          lng_drift = (rand - 0.5) * 0.01
          
          Location.find_or_create_by!(
            courier: courier,
            recorded_at: recorded_time
          ) do |loc|
            loc.geom = "POINT(#{base_lng + lng_drift} #{base_lat + lat_drift})"
            loc.accuracy_m = 3 + rand(15)
            loc.speed_mps = rand < 0.7 ? (rand * 15) : 0
            loc.battery_pct = [95 - (i * 2), 5].max
            loc.app_version = ["1.0.0", "1.0.1", "1.1.0"].sample
          end
          
          base_lat += (rand - 0.5) * 0.001
          base_lng += (rand - 0.5) * 0.001
        end
      end
    end
    
    puts "   ✓ Created #{Location.count} location tracking points"
  end

  def seed_proofs_and_otp
    puts "🔐 Seeding delivery proofs and OTP data..."
    
    delivered_shipments = Shipment.where(status: "delivered")
    
    delivered_shipments.each do |shipment|
      next if rand > 0.85
      
      proof_methods = []
      proof_methods << "photo" if rand < 0.9
      proof_methods << "otp" if shipment.otp_code_hash.present? && rand < 0.8
      proof_methods << "qr" if shipment.qr_token.present? && rand < 0.3
      proof_methods << "signature" if rand < 0.2
      
      proof_methods.each do |method|
        Proof.find_or_create_by!(
          shipment: shipment,
          method: method
        ) do |proof|
          delivery_time = shipment.updated_at + rand(2).hours
          proof.captured_at = delivery_time
          proof.storage_provider = "supabase"
          
          case method
          when "photo"
            proof.photo_key = "proofs/#{shipment.id}/photo_#{SecureRandom.uuid}.jpg"
            proof.photo_url = "https://example.supabase.co/storage/v1/object/public/#{proof.photo_key}"
            proof.photo_meta = {
              "size" => 1024 + rand(2048),
              "width" => 800 + rand(400),
              "height" => 600 + rand(300),
              "format" => "JPEG"
            }
          when "otp"
            proof.otp_last4 = "1234"
          when "qr"
            proof.qr_payload_hash = Digest::SHA256.hexdigest(shipment.qr_token)
          when "signature"
            proof.signature_svg = "<svg><!-- Mock signature --></svg>"
          end
          
          if shipment.order.address&.geom
            coords = shipment.order.address.geom.coordinates
            lat_offset = (rand - 0.5) * 0.0005
            lng_offset = (rand - 0.5) * 0.0005
            proof.geom = "POINT(#{coords[0] + lng_offset} #{coords[1] + lat_offset})"
          end
          
          proof.device_hash = Digest::SHA256.hexdigest("device_#{shipment.assigned_courier_id}_#{method}")
          proof.hash_chain = Digest::SHA256.hexdigest("#{proof.device_hash}_#{delivery_time.to_i}")
          
          proof.metadata = {
            "courier_id" => shipment.assigned_courier_id,
            "app_version" => ["1.0.0", "1.0.1", "1.1.0"].sample
          }
        end
      end
    end
    
    puts "   ✓ Created #{Proof.count} delivery proofs"
  end

  def seed_alerts
    puts "🚨 Seeding alerts and notifications..."
    
    alert_types = [
      { code: "GPS_OFFLINE", kind: "tracking", severity: "warning", message_template: "Courier GPS signal lost" },
      { code: "ETA_DELAY", kind: "delivery", severity: "warning", message_template: "Delivery running behind schedule" },
      { code: "GEOFENCE_EXIT", kind: "security", severity: "critical", message_template: "Courier left designated delivery area" },
      { code: "OTP_FAILED", kind: "delivery", severity: "warning", message_template: "Multiple failed OTP attempts" },
      { code: "LOW_BATTERY", kind: "device", severity: "info", message_template: "Courier device battery low" }
    ]
    
    Courier.where(active: true).each do |courier|
      alert_types.sample(rand(3) + 1).each do |alert_type|
        next if rand > 0.4
        
        alert_time = rand(72).hours.ago
        
        Alert.find_or_create_by!(
          code: alert_type[:code],
          courier: courier,
          status: rand < 0.7 ? "open" : "resolved"
        ) do |alert|
          alert.kind = alert_type[:kind]
          alert.severity = alert_type[:severity]
          alert.message = "#{alert_type[:message_template]} - #{courier.name}"
          alert.first_detected_at = alert_time
          alert.last_detected_at = alert_time + rand(1..6).hours
          
          alert.data = case alert_type[:code]
          when "GPS_OFFLINE"
            { "offline_duration_minutes" => rand(30..180) }
          when "ETA_DELAY"
            { "delay_minutes" => rand(30..120) }
          when "LOW_BATTERY"
            { "battery_level" => rand(5..15) }
          else
            {}
          end
        end
      end
    end
    
    puts "   ✓ Created #{Alert.count} alerts"
  end

  def seed_events
    puts "📝 Seeding system events..."
    
    Shipment.includes(:order, :assigned_courier).find_each do |shipment|
      base_time = shipment.created_at
      
      create_event("shipment.created", shipment, { order_id: shipment.order_id }, base_time)
      
      if shipment.assigned_courier
        create_event(
          "shipment.assigned",
          shipment,
          { courier_id: shipment.assigned_courier_id },
          base_time + rand(30).minutes
        )
      end
      
      case shipment.status
      when "delivered"
        create_event("shipment.delivered", shipment, { proof_count: shipment.proofs.count }, shipment.updated_at)
      when "failed"
        create_event("shipment.delivery_failed", shipment, { reason: "Customer not available" }, base_time + rand(6).hours)
      end
    end
    
    puts "   ✓ Created #{Event.count} system events"
  end

  def create_event(type_key, subject, payload, occurred_at)
    Event.find_or_create_by!(
      type_key: type_key,
      subject_id: subject.id,
      occurred_at: occurred_at
    ) do |event|
      event.payload = payload
      event.actor_kind = "system"
    end
  end

  def print_summary
    puts
    puts "📊 Seeding Summary (Scale: #{scale})"
    puts "=" * 50
    puts "👥 Users:         #{User.count}"
    puts "🚴 Couriers:      #{Courier.count} (Active: #{Courier.where(active: true).count})"
    puts "👨‍👩‍👧‍👦 Customers:     #{Customer.count}"
    puts "🏠 Addresses:     #{Address.count}"
    puts "📦 Orders:        #{Order.count}"
    puts "🚚 Shipments:     #{Shipment.count}"
    puts "🗺️  Routes:        #{Route.count}"
    puts "📍 Stops:         #{Stop.count}"
    puts "📍 Locations:     #{Location.count} tracking points"
    puts "🔐 Proofs:        #{Proof.count} delivery proofs"
    puts "🚨 Alerts:        #{Alert.count} (Open: #{Alert.open.count})"
    puts "📝 Events:        #{Event.count} system events"
    puts
    puts "🔗 Test Credentials:"
    puts "   Admin: admin@entelequia.local / changeme123"
    puts "   Ops:   ops1@entelequia.local / changeme123"
    puts "   App:   courier1@entelequia.local / changeme123"
    puts
  end

  def faker_name
    return nil unless @use_faker
    Faker::Name.name
  rescue
    nil
  end

  def faker_phone
    return "+54 11 #{rand(1000..9999)}-#{rand(1000..9999)}" unless @use_faker
    Faker::PhoneNumber.phone_number
  rescue
    "+54 11 #{rand(1000..9999)}-#{rand(1000..9999)}"
  end

  def faker_email(prefix)
    return "#{prefix}@entelequia.test" unless @use_faker
    "#{prefix}@#{Faker::Internet.domain_name}"
  rescue
    "#{prefix}@entelequia.test"
  end

  def faker_address
    return nil unless @use_faker
    Faker::Address.street_address
  rescue
    nil
  end
end
