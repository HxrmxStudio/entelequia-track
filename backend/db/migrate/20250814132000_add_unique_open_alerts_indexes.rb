class AddUniqueOpenAlertsIndexes < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  def up
    add_index :alerts,
              [:code, :status, :courier_id],
              unique: true,
              where: "status = 'open' AND courier_id IS NOT NULL",
              name: "idx_unique_open_alerts_courier",
              algorithm: :concurrently

    add_index :alerts,
              [:code, :status, :shipment_id],
              unique: true,
              where: "status = 'open' AND shipment_id IS NOT NULL",
              name: "idx_unique_open_alerts_shipment",
              algorithm: :concurrently
  end

  def down
    remove_index :alerts, name: "idx_unique_open_alerts_courier", if_exists: true
    remove_index :alerts, name: "idx_unique_open_alerts_shipment", if_exists: true
  end
end


