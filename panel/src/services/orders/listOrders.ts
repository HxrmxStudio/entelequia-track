import { apiFetch } from "@/app/lib/api";
import { buildQueryString } from "@/lib/queryBuilder";
import { ordersEndpoints } from "./endpoints";
import type { OrderItem, OrdersFilter } from "./types";

export async function listOrders(params: OrdersFilter = {}): Promise<OrderItem[]> {
  // Cast to compatible type for query builder
  const queryParams = params as Record<string, string | number | boolean | null | undefined>;
  const queryString = buildQueryString(queryParams);
  return apiFetch<OrderItem[]>(ordersEndpoints.list(queryString));
}


