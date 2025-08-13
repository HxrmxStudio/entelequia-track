export type ProofMethod = "otp" | "qr" | "photo" | "signature";

export interface ProofCreatePayload {
  method: ProofMethod;
  lat: number;
  lon: number;
  captured_at: string; // ISO8601
  photo: File;
  otp?: string; // when method = "otp"
  qr_payload?: string; // when method = "qr"
  signature_svg?: string; // when method = "signature"
}

export interface ProofResponse {
  ok: boolean;
  proof_id: string;
  photo_url: string;
}

export interface ProofError {
  error: 
    | "Photo is required"
    | "Outside delivery radius"
    | "otp_required"
    | "otp_locked"
    | "otp_expired"
    | "otp_invalid"
    | "qr_required"
    | "qr_mismatch"
    | "signature_required"
    | "invalid_method"
    | "proof_creation_failed"
    | "shipment_not_found";
  distance_m?: number;
  radius_m?: number;
}

export interface ProofValidationError {
  error: string;
  distance_m?: number;
  radius_m?: number;
}
