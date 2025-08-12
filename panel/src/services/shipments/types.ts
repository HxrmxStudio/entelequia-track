export interface Shipment {
  id: string;
  order_id: string;
  status: string;
  delivery_method: string;
  qr_token: string;
  eta?: string | null;
}

export interface ShipmentEvent {
  id: string;
  type_key: string;
  subject_id: string;
  occurred_at: string;
  payload: unknown;
}

export interface ShipmentWithEvents extends Shipment {
  events: ShipmentEvent[];
}

export interface ShipmentsFilter {
  status?: string;
  courier_id?: string;
  date?: "today";
}

export interface ListResponse<T> {
  data: T[];
  meta?: Record<string, unknown>;
}
  