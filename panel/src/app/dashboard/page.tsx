"use client";
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { subscribeRealtime } from "../lib/cable";
import { useMapLibre } from "../lib/useMapLibre";
import { useRequireAuth } from "@/app/lib/useRequireAuth";

type CourierPing = { courier_id:string; ts:string; lat:number; lon:number };
type ShipmentUpdate = { id:string; status:string };

export default function DashboardLive() {
  useRequireAuth();
  const mapDiv = useRef<HTMLDivElement|null>(null);
  const { map } = useMapLibre({
    containerRef: mapDiv,
    center: [-58.3816, -34.6037],
    zoom: 10
  });
  const [stats, setStats] = useState({ gpsOffline: 0, outForDelivery: 0, deliveredToday: 0 });

  useEffect(() => {
    if (!map) return;
    type RealtimeEvent =
      | { type: "courier.location"; data: CourierPing }
      | { type: "shipment.updated"; data: ShipmentUpdate }
      | { type: string; data: unknown };

    const unsub = subscribeRealtime((payload: unknown) => {
      const msg = payload as RealtimeEvent;
      if (msg.type === "courier.location") {
        const d = msg.data as CourierPing;
        new maplibregl.Marker().setLngLat([d.lon, d.lat]).addTo(map);
      }
      if (msg.type === "shipment.updated") {
        const d = msg.data as ShipmentUpdate;
        setStats(s => ({
          ...s,
          outForDelivery: s.outForDelivery + (d.status === "out_for_delivery" ? 1 : 0),
          deliveredToday: s.deliveredToday + (d.status === "delivered" ? 1 : 0)
        }));
      }
    });
    return () => { unsub?.unsubscribe?.(); };
  }, [map]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
      <div className="col-span-1 border rounded p-4">
        <h2 className="font-semibold mb-2">SLA</h2>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex justify-between"><span>GPS offline</span><b>{stats.gpsOffline}</b></div>
          <div className="flex justify-between"><span>En ruta</span><b>{stats.outForDelivery}</b></div>
          <div className="flex justify-between"><span>Entregas hoy</span><b>{stats.deliveredToday}</b></div>
        </div>
      </div>
      <div className="col-span-1 lg:col-span-3">
        <div ref={mapDiv} className="h-[480px] rounded overflow-hidden border" />
      </div>
    </div>
  );
}
