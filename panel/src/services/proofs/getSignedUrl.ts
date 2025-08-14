import { apiFetch } from "@/app/lib/api";
import { proofEndpoints } from "./endpoints";

export async function getProofSignedUrl(proofId: string): Promise<string> {
  const resp = await apiFetch<{ url: string }>(proofEndpoints.signedUrl(proofId), { timeoutMs: 10000 });
  return resp.url;
}
