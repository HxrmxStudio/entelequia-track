class Order < ApplicationRecord
  belongs_to :customer, optional: true
  belongs_to :address, optional: true
  has_one :shipment, dependent: :destroy

  # Channel enum - maps from "Entrega" field in CSV
  enum :channel, {
    # Web/Default
    web: "web",
    
    # Moto delivery
    moto: "moto",
    
    # Mail delivery
    correo: "correo",
    correo_sucursal: "correo_sucursal",
    
    # Courier services
    dhl: "dhl",
    andreani: "andreani",
    urbano: "urbano",
    fast_mail: "fast_mail",
    
    # Marketplace
    mercado_envios: "mercado_envios",
    
    # Digital
    email: "email",
    
    # Special services
    mismo_dia: "mismo_dia",
    gratuito: "gratuito",
    
    # Pickup
    sucursal: "sucursal",
    sucursal_belgrano: "sucursal_belgrano",
    sucursal_centro: "sucursal_centro"
  }

  # Status enum - maps from "Estado" field in CSV
  enum :status, {
    # Initial states
    received: "received",
    
    # Preparation states
    preparing: "preparing",
    
    # Payment states
    pending_payment: "pending_payment",
    payment_failed: "payment_failed",
    payment_pending: "payment_pending",
    
    # Ready states
    ready_for_dispatch: "ready_for_dispatch",
    ready_for_pickup: "ready_for_pickup",
    ready_for_delivery: "ready_for_delivery",
    
    # Active states
    in_transit: "in_transit",
    waiting: "waiting",
    processing: "processing",
    
    # Final states
    completed: "completed",
    
    # Cancellation states
    canceled: "canceled",
    
    # Refund states
    refunded: "refunded",
    
    # Failure states
    failed: "failed"
  }

  validates :external_ref, presence: true, uniqueness: true
  validates :status, inclusion: { in: statuses.keys }
  validates :channel, inclusion: { in: channels.keys }
  validates :amount_cents, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :currency, presence: true, length: { maximum: 3 }
end
  