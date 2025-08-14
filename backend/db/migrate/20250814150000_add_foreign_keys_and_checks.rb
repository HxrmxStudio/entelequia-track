class AddForeignKeysAndChecks < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def up
    # Foreign keys (added NOT VALID first, then validated to avoid long locks)
    add_foreign_key :routes, :couriers, column: :courier_id, on_delete: :restrict, validate: false

    add_foreign_key :stops, :routes, column: :route_id, on_delete: :cascade, validate: false

    add_foreign_key :stops, :shipments, column: :shipment_id, on_delete: :cascade, validate: false

    add_foreign_key :shipments, :orders, column: :order_id, on_delete: :restrict, validate: false

    add_foreign_key :shipments, :couriers, column: :assigned_courier_id, on_delete: :nullify, validate: false

    add_foreign_key :proofs, :shipments, column: :shipment_id, on_delete: :cascade, validate: false

    add_foreign_key :orders, :customers, column: :customer_id, on_delete: :nullify, validate: false

    add_foreign_key :orders, :addresses, column: :address_id, on_delete: :nullify, validate: false

    add_foreign_key :couriers, :users, column: :user_id, on_delete: :nullify, validate: false

    add_foreign_key :locations, :couriers, column: :courier_id, on_delete: :cascade, validate: false

    add_foreign_key :alerts, :couriers, column: :courier_id, on_delete: :nullify, validate: false

    add_foreign_key :alerts, :shipments, column: :shipment_id, on_delete: :nullify, validate: false

    add_foreign_key :alerts, :routes, column: :route_id, on_delete: :nullify, validate: false

    # Check constraints (added NOT VALID, then validated)
    add_check_constraint :stops, "sequence >= 0", name: "stops_sequence_nonnegative", validate: false

    add_check_constraint :shipments, "geofence_radius_m > 0", name: "shipments_geofence_radius_positive", validate: false

    add_check_constraint :shipments, "otp_attempts >= 0", name: "shipments_otp_attempts_nonnegative", validate: false

    add_check_constraint :orders, "amount_cents >= 0", name: "orders_amount_cents_nonnegative", validate: false

    add_check_constraint :locations, "battery_pct IS NULL OR (battery_pct >= 0 AND battery_pct <= 100)", name: "locations_battery_pct_range", validate: false
  end

  def down
    # Check constraints
    remove_check_constraint :locations, name: "locations_battery_pct_range"
    remove_check_constraint :orders, name: "orders_amount_cents_nonnegative"
    remove_check_constraint :shipments, name: "shipments_otp_attempts_nonnegative"
    remove_check_constraint :shipments, name: "shipments_geofence_radius_positive"
    remove_check_constraint :stops, name: "stops_sequence_nonnegative"

    # Foreign keys
    remove_foreign_key :alerts, column: :route_id
    remove_foreign_key :alerts, column: :shipment_id
    remove_foreign_key :alerts, column: :courier_id
    remove_foreign_key :locations, column: :courier_id
    remove_foreign_key :couriers, column: :user_id
    remove_foreign_key :orders, column: :address_id
    remove_foreign_key :orders, column: :customer_id
    remove_foreign_key :proofs, column: :shipment_id
    remove_foreign_key :shipments, column: :assigned_courier_id
    remove_foreign_key :shipments, column: :order_id
    remove_foreign_key :stops, column: :shipment_id
    remove_foreign_key :stops, column: :route_id
    remove_foreign_key :routes, column: :courier_id
  end
end


