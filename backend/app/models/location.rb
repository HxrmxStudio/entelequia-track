class Location < ApplicationRecord
  # Use surrogate PK (id) and enforce uniqueness via index
  belongs_to :courier

  validates :recorded_at, presence: true
  validates :courier_id, presence: true
  validates :accuracy_m, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :speed_mps, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true
  validates :battery_pct, numericality: { only_integer: true, greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }, allow_nil: true
end
  