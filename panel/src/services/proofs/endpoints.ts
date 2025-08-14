export const proofEndpoints = {
  presign: () => `/api/v1/proofs/presign`,
  create: () => `/api/v1/proofs`,
  signedUrl: (proofId: string) => `/api/v1/proofs/${proofId}/signed_url`
} as const;
