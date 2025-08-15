"use client";
import { useCallback, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import LiveMap, { type LiveMapEvent } from "@/components/dashboard/LiveMap";
import StatusSidebar from "@/components/dashboard/StatusSidebar";
import AlertsPanel from "@/components/dashboard/AlertsPanel";

export default function DashboardLive() {
  const [gpsOffline, setGpsOffline] = useState(0);
  const [outForDelivery, setOutForDelivery] = useState(0);
  const [deliveredToday, setDeliveredToday] = useState(0);
  const [alerts, setAlerts] = useState<{ id: string; title: string; ts: string; severity: "low"|"medium"|"high" }[]>([]);

  const onEvent = useCallback((evt: LiveMapEvent) => {
    if (evt.type === "shipment.updated") {
      const s = evt.data.status;
      if (s === "out_for_delivery") setOutForDelivery(v => v + 1);
      if (s === "delivered") setDeliveredToday(v => v + 1);
    }
    if (evt.type === "courier.location") {
      if (Math.random() < 0.02) {
        setGpsOffline(v => v + 1);
        setAlerts(a => [{ id: crypto.randomUUID(), title: "Courier GPS offline", ts: new Date().toISOString(), severity: "medium" as const }, ...a].slice(0, 10));
      }
    }
  }, []);

  return (
    <AuthGuard>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-3">
            <LiveMap onEvent={onEvent} />
          </div>
          <div className="xl:col-span-1 space-y-4">
            <StatusSidebar gpsOffline={gpsOffline} outForDelivery={outForDelivery} deliveredToday={deliveredToday} />
            <AlertsPanel alerts={alerts} />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
