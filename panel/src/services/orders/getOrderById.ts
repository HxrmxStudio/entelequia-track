import { apiFetch } from "@/app/lib/api";
import { ordersEndpoints } from "./endpoints";

export async function getOrderById(id: string): Promise<unknown> {
  return apiFetch(ordersEndpoints.get(id));
}


