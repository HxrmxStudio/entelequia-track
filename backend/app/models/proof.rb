class Proof < ApplicationRecord
  belongs_to :shipment

  # Use symbol-first signature to avoid Ruby 3.4 keyword arg ambiguity
  enum :method, { otp: "otp", qr: "qr", photo: "photo", signature: "signature" }
  enum :storage_provider, { supabase: "supabase", s3: "s3" }, prefix: :storage

  validates :captured_at, presence: true
  validates :photo_key, presence: true, if: -> { photo? || qr? }
  validates :method, inclusion: { in: methods.keys }
  validates :storage_provider, inclusion: { in: storage_providers.keys }
end
  