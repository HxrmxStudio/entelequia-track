class Location < ApplicationRecord
  # Use surrogate PK (id) and enforce uniqueness via index
  belongs_to :courier

  validates :recorded_at, presence: true
  validates :courier_id, presence: true
end
  