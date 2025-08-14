class AddOtpAndControlsToShipments < ActiveRecord::Migration[7.1]
  disable_ddl_transaction!

  def up
    if Rails.env.test?
      say "Skipping AddOtpAndControlsToShipments in test environment"
      return
    end
    change_table :shipments do |t|
      t.integer  :otp_attempts, default: 0, null: false
      t.datetime :otp_locked_until
      t.integer  :geofence_radius_m, default: 100, null: false
      t.string   :otp_code_hash, limit: 128
      t.datetime :otp_generated_at
      t.datetime :otp_expires_at
      t.string   :qr_token, limit: 128
    end

    add_index :shipments, :qr_token, unique: true, algorithm: :concurrently
    add_index :shipments, :otp_expires_at, algorithm: :concurrently
  end

  def down
    if Rails.env.test?
      say "Skipping down of AddOtpAndControlsToShipments in test environment"
      return
    end
    remove_index :shipments, :otp_expires_at
    remove_index :shipments, :qr_token

    change_table :shipments do |t|
      t.remove :qr_token
      t.remove :otp_expires_at
      t.remove :otp_generated_at
      t.remove :otp_code_hash
      t.remove :geofence_radius_m
      t.remove :otp_locked_until
      t.remove :otp_attempts
    end
  end
end
