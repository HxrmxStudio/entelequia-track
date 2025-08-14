import { apiFetch } from "@/app/lib/api";
import { ordersEndpoints } from "./endpoints";
import type { OrderItem, OrdersFilter } from "./types";

export async function listOrders(params: OrdersFilter = {}): Promise<OrderItem[]> {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", String(params.status));
  return apiFetch<OrderItem[]>(ordersEndpoints.list(sp.toString()));
}


