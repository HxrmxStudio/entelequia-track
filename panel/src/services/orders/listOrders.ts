import { apiFetch } from "@/app/lib/api";
import { ordersEndpoints } from "./endpoints";

export async function listOrders(status?: string): Promise<unknown> {
  const q = status ? new URLSearchParams({ status }).toString() : "";
  return apiFetch(ordersEndpoints.list(q));
}


