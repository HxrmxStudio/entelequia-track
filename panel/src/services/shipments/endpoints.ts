export const shipmentsEndpoints = {
  list: (q: string) => `/shipments?${q}`,
  get: (id: string) => `/shipments/${id}`,
  assign: (id: string) => `/shipments/${id}/assign`,
  regenOtp: (id: string) => `/shipments/${id}/otp`,
  update: (id: string) => `/shipments/${id}`
} as const;