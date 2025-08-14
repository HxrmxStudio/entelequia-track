"use client";
import type { Alert, RealtimeAlertCreatedEvent, RealtimeAlertResolvedEvent } from "./types";

type SubscribeParams = {
  onAlert?: (alert: Alert) => void;
  onResolved?: (id: number | string) => void;
};

// Reuse project's realtime client
// Assumes there is a helper at app/lib/cable exporting subscribeRealtime({ topics, onMessage })
// to keep concerns centralized and avoid re-implementing sockets here.
// If this helper changes, update only this adapter layer.
import { subscribeRealtime } from "@/app/lib/cable";

export function subscribeToAlerts({ onAlert, onResolved }: SubscribeParams) {
  const unsubscribe = subscribeRealtime({
    topics: ["alerts"],
    onMessage: (msg: unknown) => {
      // Narrow known event shapes coming from backend
      const evt = msg as RealtimeAlertCreatedEvent | RealtimeAlertResolvedEvent | { type?: string };
      if (!evt || typeof evt !== "object" || !("type" in evt)) return;

      if (evt.type === "alert.created") {
        const data = (evt as RealtimeAlertCreatedEvent).data;
        if (data && onAlert) onAlert(data);
        return;
      }
      if (evt.type === "alert.resolved") {
        const data = (evt as RealtimeAlertResolvedEvent).data;
        if (data?.id != null && onResolved) onResolved(data.id);
        return;
      }
    },
  });

  return () => {
    try { unsubscribe?.(); } catch { /* noop */ }
  };
}


