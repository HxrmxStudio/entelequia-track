export const proofEndpoints = {
  create: (shipmentId: string) => `/shipments/${shipmentId}/proofs`
} as const;
