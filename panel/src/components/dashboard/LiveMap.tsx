"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMapLibre } from "../../../hooks/useMapLibre";
import { subscribeRealtime } from "@/app/lib/cable";

export type LiveMapEvent =
  | { type: "courier.location"; data: { courier_id: string; ts: string; lat: number; lon: number } }
  | { type: "shipment.updated"; data: { id: string; status: string } };

type Props = {
  initialCenter?: { lat: number; lon: number };
  zoom?: number;
  onEvent?: (evt: LiveMapEvent) => void;
};

export default function LiveMap({ initialCenter = { lat: -34.6037, lon: -58.3816 }, zoom = 11, onEvent }: Props) {
  const mapDiv = useRef<HTMLDivElement | null>(null);
  const { map } = useMapLibre({ containerRef: mapDiv, center: [initialCenter.lon, initialCenter.lat], zoom });

  useEffect(() => {
    if (!map) return;
    const unsub = subscribeRealtime((payload: unknown) => {
      const evt = payload as LiveMapEvent;
      if (evt?.type === "courier.location") {
        const d = evt.data;
        new maplibregl.Marker({ color: "#111827" }).setLngLat([d.lon, d.lat]).addTo(map);
      }
      if (onEvent) onEvent(evt);
    });
    return () => { try { unsub?.(); } catch {} };
  }, [map, onEvent]);

  return <div ref={mapDiv} className="h-[500px] w-full rounded-lg overflow-hidden border" />;
}


