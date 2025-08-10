class ShipmentSerializer
  def initialize(shipment)
    @shipment = shipment
  end

  def as_json
    {
      id: @shipment.id,
      order_id: @shipment.order_id,
      status: @shipment.status,
      delivery_method: @shipment.delivery_method,
      qr_token: @shipment.qr_token,
      eta: @shipment.eta,
      events: Event.where(subject_id: @shipment.id).order(occurred_at: :asc).map { |e| event_json(e) }
    }
  end

  private

  def event_json(e)
    {
      id: e.id,
      type_key: e.type_key,
      subject_id: e.subject_id,
      occurred_at: e.occurred_at,
      payload: e.payload
    }
  end
end
