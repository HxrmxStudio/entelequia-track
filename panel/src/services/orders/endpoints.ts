import { apiFetch } from "@/app/lib/api";

export const ordersEndpoints = {
  list: (q: string) => `/orders${q ? `?${q}` : ""}`,
  get: (id: string) => `/orders/${id}`
} as const;

export async function getOrders(status?: string): Promise<unknown> {
  const q = status ? new URLSearchParams({ status }).toString() : "";
  return apiFetch(ordersEndpoints.list(q));
}

export async function getOrder(id: string): Promise<unknown> {
  return apiFetch(ordersEndpoints.get(id));
}
