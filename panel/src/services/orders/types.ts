export type OrderStatus = 
  | "received" 
  | "draft" 
  | "placed" 
  | "confirmed" 
  | "fulfilled" 
  | "canceled"
  | "preparing"
  | "ready_for_delivery"
  | "pending_payment"
  | "payment_failed"
  | "in_transit"
  | "completed"
  | "waiting"
  | "ready_for_pickup"
  | "payment_pending";

export interface OrderItem {
  id: string;
  external_ref?: string | null;
  customer_id?: string | null;
  address_id?: string | null;
  status: OrderStatus;
  channel?: string | null;
  amount_cents?: number | null;
  currency?: string | null;
  delivery_window?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface OrdersFilter {
  status?: OrderStatus | string;
  channel?: string;
  amount_range?: 'low' | 'medium' | 'high';
}

// Utility types for filter options
export interface FilterOptions {
  statuses: OrderStatus[];
  channels: string[];
}


