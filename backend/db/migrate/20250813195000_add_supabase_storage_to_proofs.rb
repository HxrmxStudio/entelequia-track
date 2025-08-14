class AddSupabaseStorageToProofs < ActiveRecord::Migration[7.1]
  def change
    add_column :proofs, :photo_key, :string
    add_column :proofs, :storage_provider, :string, null: false, default: "supabase"
    add_column :proofs, :photo_meta, :jsonb, null: false, default: {}
    add_index  :proofs, :storage_provider
  end
end


