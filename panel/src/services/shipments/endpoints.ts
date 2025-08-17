export const shipmentsEndpoints = {
  list: (q?: string) => q && q.length > 0 ? `/shipments?${q}` : `/shipments`,
  get: (id: string) => `/shipments/${id}`,
  assign: (id: string) => `/shipments/${id}/assign`,
  regenOtp: (id: string) => `/shipments/${id}/otp`,
  update: (id: string) => `/shipments/${id}`
} as const;