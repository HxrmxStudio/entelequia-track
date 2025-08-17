export type OrderStatus = "received" | "draft" | "placed" | "confirmed" | "fulfilled" | "canceled";

export interface OrderItem {
  id: string;
  external_ref?: string | null;
  customer_id?: string | null;
  address_id?: string | null;
  status: OrderStatus;
  channel?: string | null;
  amount_cents?: number | null;
  currency?: string | null;
  delivery_window_start?: string | null;
  delivery_window_end?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface OrdersFilter {
  status?: OrderStatus | string;
  channel?: string;
  amount_range?: 'low' | 'medium' | 'high';
}


