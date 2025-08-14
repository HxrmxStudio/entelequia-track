import { apiFetch } from "@/app/lib/api";
import { usersEndpoints } from "./endpoints";

export async function destroyUser(id: string): Promise<void> {
  return apiFetch<void>(usersEndpoints.destroy(id), {
    method: "DELETE"
  });
}
