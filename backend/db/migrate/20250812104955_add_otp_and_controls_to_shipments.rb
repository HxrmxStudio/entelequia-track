class AddOtpAndControlsToShipments < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  def up
    if Rails.env.test?
      say "Skipping AddOtpAndControlsToShipments in test environment"
      return
    end
    
    # Only add columns that don't exist yet
    change_table :shipments do |t|
      t.datetime :otp_generated_at unless column_exists?(:shipments, :otp_generated_at)
      t.datetime :otp_expires_at unless column_exists?(:shipments, :otp_expires_at)
    end

    # Add indexes that don't exist yet
    add_index :shipments, :otp_expires_at, algorithm: :concurrently unless index_exists?(:shipments, :otp_expires_at)
  end

  def down
    if Rails.env.test?
      say "Skipping down of AddOtpAndControlsToShipments in test environment"
      return
    end
    
    # Only remove indexes and columns that were added by this migration
    remove_index :shipments, :otp_expires_at if index_exists?(:shipments, :otp_expires_at)

    change_table :shipments do |t|
      t.remove :otp_expires_at if column_exists?(:shipments, :otp_expires_at)
      t.remove :otp_generated_at if column_exists?(:shipments, :otp_generated_at)
    end
  end
end
