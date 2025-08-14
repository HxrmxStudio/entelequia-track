class CreateAlerts < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  def up
    create_table :alerts, id: :uuid do |t|
      t.string  :code,    null: false
      t.string  :kind,    null: false
      t.string  :severity, null: false, default: "warning"
      t.string  :status,   null: false, default: "open"
      t.string  :message,  null: false
      t.uuid    :courier_id
      t.uuid    :shipment_id
      t.uuid    :route_id
      t.datetime :first_detected_at, null: false
      t.datetime :last_detected_at,  null: false
      t.jsonb   :data, null: false, default: {}
      t.timestamps
    end

    add_index :alerts, [:code, :courier_id, :shipment_id, :status], algorithm: :concurrently
    add_index :alerts, :last_detected_at, algorithm: :concurrently
    add_index :alerts, :status, algorithm: :concurrently
  end

  def down
    remove_index :alerts, :status, if_exists: true
    remove_index :alerts, :last_detected_at, if_exists: true
    remove_index :alerts, [:code, :courier_id, :shipment_id, :status], if_exists: true
    drop_table :alerts
  end
end


