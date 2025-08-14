import { apiFetch } from "@/app/lib/api";
import { proofEndpoints } from "./endpoints";
import type { ProofCreatePayload, ProofResponse, PresignUploadResponse, StorageProvider } from "./types";

export async function postProof(
  shipmentId: string,
  payload: ProofCreatePayload
): Promise<ProofResponse> {
  // Validate required fields per stricter backend
  if (!payload || !payload.method) {
    throw new Error("method is required");
  }
  if (!payload.captured_at) {
    throw new Error("captured_at is required (ISO8601)");
  }

  // 1) Presign upload on backend
  const presign = await apiFetch<PresignUploadResponse>(proofEndpoints.presign(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: payload.photo.name, content_type: payload.photo.type }),
    timeoutMs: 15000
  });

  // 2) Upload file directly to Supabase signed URL
  await fetch(presign.upload_url, {
    method: "PUT",
    headers: presign.headers,
    body: payload.photo
  }).then((r) => {
    if (!r.ok) throw new Error(`Upload failed: ${r.status}`);
  });

  // 3) Create proof record in backend (JSON)
  const storage_provider: StorageProvider = payload.storage_provider ?? "supabase";
  const body = {
    shipment_id: shipmentId,
    key: presign.key,
    method: payload.method,
    lat: payload.lat,
    lon: payload.lon,
    captured_at: payload.captured_at,
    otp: payload.otp,
    qr_payload: payload.qr_payload,
    signature_svg: payload.signature_svg,
    storage_provider
  };

  // Conditionally required photo key when method is photo or qr
  if ((payload.method === "photo" || payload.method === "qr") && !presign.key) {
    throw new Error("photo_key is required for method=photo|qr");
  }

  return apiFetch<ProofResponse>(proofEndpoints.create(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    timeoutMs: 15000
  });
}
