import type { Alert } from "./types";

export type Severity = "info" | "warning" | "critical";

// Business rules for severity normalization on the client.
// If backend severity is not provided or not exposed, compute from payload.
export function computeSeverity(alert: Alert): Severity {
  // Example for ETA/Shipment delays
  if (alert.type === "shipment_delayed" || alert.type === "eta_delay") {
    const delay = Number(alert.payload?.delay_min ?? 0);
    if (delay >= 30) return "critical";
    if (delay >= 10) return "warning";
    return "info";
  }
  // GPS offline could also use payload thresholds if needed later
  return "warning";
}

export function severityClass(sev: Severity): string {
  switch (sev) {
    case "critical":
      return "bg-red-600 text-white";
    case "warning":
      return "bg-amber-500 text-white";
    default:
      return "bg-gray-300 text-gray-800";
  }
}


