import { couriersEndpoints, type ListCouriersQuery } from './endpoints';
import type { Courier } from './types';
import { apiFetch } from "@/app/lib/api";

export async function listCouriers(q?: ListCouriersQuery): Promise<Courier[]> {
  return apiFetch<Courier[]>(couriersEndpoints.list(q));
}