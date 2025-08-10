class Courier < ApplicationRecord
    belongs_to :user, optional: true
    has_many :routes
    has_many :locations, primary_key: :id, foreign_key: :courier_id
  
    validates :code, presence: true, uniqueness: true
    validates :name, presence: true
  end
  