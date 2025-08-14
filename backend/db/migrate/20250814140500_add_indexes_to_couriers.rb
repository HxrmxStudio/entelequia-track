class AddIndexesToCouriers < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  def up
    add_index :couriers, :email, algorithm: :concurrently
    add_index :couriers, :phone, algorithm: :concurrently
    add_index :couriers, :active, algorithm: :concurrently
  end

  def down
    remove_index :couriers, :email, if_exists: true
    remove_index :couriers, :phone, if_exists: true
    remove_index :couriers, :active, if_exists: true
  end
end



