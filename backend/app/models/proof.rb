class Proof < ApplicationRecord
    belongs_to :shipment
  
    enum :method, { otp: "otp", qr: "qr", photo: "photo", signature: "signature" }
    validates :method, inclusion: { in: methods.keys }
    validates :captured_at, presence: true
  end
  