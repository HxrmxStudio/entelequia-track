import { apiFetch } from "@/app/lib/api";
import { ordersEndpoints } from "./endpoints";
import type { OrderItem } from "./types";

export async function getOrderById(id: string): Promise<OrderItem> {
  return apiFetch<OrderItem>(ordersEndpoints.get(id));
}


