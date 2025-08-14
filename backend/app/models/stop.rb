class Stop < ApplicationRecord
    belongs_to :route
    belongs_to :shipment
  
    enum :status, { pending: "pending", arrived: "arrived", completed: "completed", failed: "failed", skipped: "skipped" }
    validates :sequence, presence: true,
                         numericality: { only_integer: true, greater_than_or_equal_to: 0 }
    validates :sequence, uniqueness: { scope: :route_id }
  end
  