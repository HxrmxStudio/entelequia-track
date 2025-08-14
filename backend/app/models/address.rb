class Address < ApplicationRecord
    validates :line1, presence: true
    # geom se setea al geocodificar (opcional en MVP)
    validates :country, presence: true
  end
  