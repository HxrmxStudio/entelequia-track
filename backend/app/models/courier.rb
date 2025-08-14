class Courier < ApplicationRecord
    belongs_to :user, optional: true
    has_many :routes
    has_many :locations, primary_key: :id, foreign_key: :courier_id
  
    validates :code, presence: true, uniqueness: true
    validates :name, presence: true
    validates :email, format: { with: /\A[^@\s]+@[^@\s]+\.[^@\s]+\z/ }, allow_blank: true
    validates :phone, format: { with: /\A\+?[0-9\-\s\(\)]{7,20}\z/ }, allow_blank: true
    validates :vehicle, length: { maximum: 50 }, allow_blank: true
    validates :notes, length: { maximum: 1000 }, allow_blank: true
    validates :active, inclusion: { in: [true, false] }
  end
  