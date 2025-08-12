import { apiFetch } from "@/app/lib/api";
import { trackEndpoints } from "./endpoints";
import type { PublicTrack } from "./types";

export async function fetchPublicTrack(code: string): Promise<PublicTrack> {
  return apiFetch<PublicTrack>(trackEndpoints.publicTrack(code));
}


