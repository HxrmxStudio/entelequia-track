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
  end
  