class AddDetailsToCouriers < ActiveRecord::Migration[7.1]
  def change
    add_column :couriers, :email, :string
    add_column :couriers, :phone, :string
    add_column :couriers, :vehicle, :string
    add_column :couriers, :notes, :text
  end
end


