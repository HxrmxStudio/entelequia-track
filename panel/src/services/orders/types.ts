export type OrderStatus = "draft" | "placed" | "confirmed" | "canceled" | "fulfilled" | string;

export interface OrderItem {
  id: string;
  external_ref?: string | null;
  status: OrderStatus;
  amount_cents?: number | null;
  currency?: string | null;
  channel?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
}

export interface OrdersFilter {
  status?: OrderStatus | string;
}


