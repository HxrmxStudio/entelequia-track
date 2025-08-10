require "securerandom"

puts "== Creating admin user =="
User.find_or_create_by!(email: "admin@entelequia.local") do |u|
  u.password = "admin1234"
  u.role = "admin"
  u.name = "Admin"
end

puts "== Creating sample couriers =="
c1 = Courier.find_or_create_by!(code: "C-001") { |c| c.name = "Repartidor 1" }
c2 = Courier.find_or_create_by!(code: "C-002") { |c| c.name = "Repartidor 2" }

puts "== Example customer/address/order/shipment =="
customer = Customer.find_or_create_by!(name: "Juan Pérez") { |c| c.phone = "+54..." }
address  = Address.create!(line1: "Av. Siempre Viva 123", city: "CABA", province_state: "CABA", postal_code: "C1000")
order    = Order.find_or_create_by!(external_ref: "PED-TEST-001") do |o|
  o.customer = customer
  o.address  = address
  o.channel  = "web"
  o.status   = "received"
  o.amount_cents = 25000
end
Shipment.find_or_create_by!(order: order) do |s|
  s.status = "queued"
  s.delivery_method = "courier"
  s.qr_token = SecureRandom.uuid
  s.sla_due_at = 2.hours.from_now
end

puts "Seeds OK."
