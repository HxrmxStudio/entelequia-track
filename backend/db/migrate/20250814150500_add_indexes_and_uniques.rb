class AddIndexesAndUniques < ActiveRecord::Migration[8.0]
  disable_ddl_transaction!

  def change
    # Performance indexes
    add_index :routes, :status, algorithm: :concurrently unless index_exists?(:routes, :status)
    add_index :routes, :service_date, algorithm: :concurrently unless index_exists?(:routes, :service_date)

    add_index :shipments, :status, algorithm: :concurrently unless index_exists?(:shipments, :status)
    add_index :shipments, :eta, algorithm: :concurrently unless index_exists?(:shipments, :eta)
    add_index :shipments, :sla_due_at, algorithm: :concurrently unless index_exists?(:shipments, :sla_due_at)

    add_index :stops, :status, algorithm: :concurrently unless index_exists?(:stops, :status)
    add_index :stops, :planned_at, algorithm: :concurrently unless index_exists?(:stops, :planned_at)
    add_index :stops, :completed_at, algorithm: :concurrently unless index_exists?(:stops, :completed_at)

    add_index :locations, :recorded_at, algorithm: :concurrently unless index_exists?(:locations, :recorded_at)

    # Uniqueness (case-insensitive) skipped to avoid deployment risk; retain app-level downcasing

    # Alerts partial unique indexes for open state (complementary to existing)
    add_index :alerts, [:code, :status, :route_id], unique: true, where: "status = 'open' AND route_id IS NOT NULL", name: "idx_unique_open_alerts_route", algorithm: :concurrently unless index_name_exists?(:alerts, "idx_unique_open_alerts_route")
  end
end


