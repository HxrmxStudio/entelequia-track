class Order < ApplicationRecord
    belongs_to :customer, optional: true
    belongs_to :address, optional: true
    has_one :shipment, dependent: :destroy
  
    enum :status, {
      received: "received", preparing: "preparing",
      ready_for_dispatch: "ready_for_dispatch",
      canceled: "canceled"
    }
  
    validates :external_ref, presence: true, uniqueness: true
    validates :status, inclusion: { in: statuses.keys }
    validates :amount_cents, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
    validates :currency, presence: true, length: { maximum: 3 }
  end
  