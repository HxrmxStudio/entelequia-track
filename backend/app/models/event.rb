class Event < ApplicationRecord
    # subject_id polymórfico ad-hoc (Shipment u otros)
    validates :type_key, :subject_id, :occurred_at, presence: true
  end
  