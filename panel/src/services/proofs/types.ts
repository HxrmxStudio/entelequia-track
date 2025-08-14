export type ProofMethod = "otp" | "qr" | "photo" | "signature";
export type StorageProvider = "supabase" | "s3";

export interface ProofCreatePayload {
  method: ProofMethod;
  photo: File;
  // storage key after presign
  key?: string;
  // Optional geostamp for panel (manual). Required when used by courier-app
  lat?: number;
  lon?: number;
  // required by backend stricter validation
  captured_at: string; // ISO8601
  // when method = "otp"
  otp?: string;
  // when method = "qr"
  qr_payload?: string;
  // when method = "signature"
  signature_svg?: string;
  // default to supabase unless explicitly s3
  storage_provider?: StorageProvider;
  // require when method in ["photo","qr"]; service ensures this using `key`
  photo_key?: string;
}

export interface ProofResponse {
  ok: boolean;
  proof_id: string;
  key?: string;
  warning?: string;
}

export interface PresignUploadResponse {
  upload_url: string;
  headers: Record<string, string>;
  key: string;
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
