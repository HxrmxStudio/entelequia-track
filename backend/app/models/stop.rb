class Stop < ApplicationRecord
    belongs_to :route
    belongs_to :shipment
  
    enum :status, { pending: "pending", arrived: "arrived", completed: "completed", failed: "failed", skipped: "skipped" }
    validates :sequence, presence: true
  end
  