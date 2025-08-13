import { apiForm } from "@/app/lib/api";
import { proofEndpoints } from "./endpoints";
import type { ProofCreatePayload, ProofResponse } from "./types";

export async function postProof(
  shipmentId: string, 
  payload: ProofCreatePayload
): Promise<ProofResponse> {
  const formData = new FormData();
  
  // Required fields
  formData.append("method", payload.method);
  formData.append("lat", payload.lat.toString());
  formData.append("lon", payload.lon.toString());
  formData.append("captured_at", payload.captured_at);
  formData.append("photo", payload.photo);
  
  // Optional fields based on method
  if (payload.method === "otp" && payload.otp) {
    formData.append("otp", payload.otp);
  }
  
  if (payload.method === "qr" && payload.qr_payload) {
    formData.append("qr_payload", payload.qr_payload);
  }
  
  if (payload.method === "signature" && payload.signature_svg) {
    formData.append("signature_svg", payload.signature_svg);
  }
  
  return apiForm<ProofResponse>(proofEndpoints.create(shipmentId), formData);
}
