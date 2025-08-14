class Route < ApplicationRecord
    belongs_to :courier
    has_many :stops, -> { order(sequence: :asc) }, dependent: :destroy
  
    enum :status, { planned: "planned", in_progress: "in_progress", completed: "completed" }
    validates :service_date, presence: true
    validates :status, inclusion: { in: statuses.keys }
  end
  