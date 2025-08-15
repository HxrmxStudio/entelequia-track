"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { fetchPublicTrack } from "@/services/track/actionService";
import type { PublicTrack } from "@/services/track/types";
import { useMapLibre } from "../../../hooks/useMapLibre";
import { subscribeRealtime } from "@/app/lib/cable";
import * as turf from "@turf/turf";

type PublicTrackPageProps = { params: Promise<{ code: string }> };

export default function PublicTrackPage({ params }: PublicTrackPageProps) {
  const mapDiv = useRef<HTMLDivElement|null>(null);
  const rasterOSM = useMemo(
    () => ({
      version: 8,
      sources: {
        carto: {
          type: "raster",
          tiles: [
            "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            "https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          ],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors © CARTO"
        }
      },
      layers: [{ id: "carto", type: "raster", source: "carto" }]
    }),
    []
  );
  const { map } = useMapLibre({
    containerRef: mapDiv,
    center: [ -58.3816, -34.6037 ],
    zoom: 12,
    style: rasterOSM
  });
  const [data, setData] = useState<PublicTrack| null>(null);
  const [code, setCode] = useState<string>("");
  useEffect(() => {
    let mounted = true;
    Promise.resolve(params).then(p => { if (mounted) setCode(p.code); });
    return () => { mounted = false; };
  }, [params]);

  useEffect(() => {
    let isMounted = true;
    if (!code) return;
    fetchPublicTrack(code)
      .then((payload: PublicTrack) => { if (isMounted) setData(payload); })
      .catch(() => { if (isMounted) setData(null); });
    return () => { isMounted = false; };
  }, [code]);

  useEffect(() => {
    if (!map || !data) return;
    map.setMaxZoom?.(20);

    // destination marker + center + simple geofence circle using a fill layer
    if (data.destination?.lat && data.destination?.lon) {
      const dest = [data.destination.lon, data.destination.lat] as [number, number];
      new maplibregl.Marker({ color: "#0070f3" }).setLngLat(dest).addTo(map);
      map.setCenter(dest);

      // Geofence: simple 100m circle (adjust as needed or fetch from API when available)
      const radiusM = 100;
      const geofence = turf.circle(dest, radiusM / 1000, { steps: 64, units: "kilometers" });
      const ensureGeofence = () => {
        if (!map.getSource("public-geofence")) {
          map.addSource("public-geofence", { type: "geojson", data: geofence as unknown as GeoJSON.FeatureCollection });
          map.addLayer({ id: "public-geofence-fill", type: "fill", source: "public-geofence", paint: { "fill-color": "#0070f3", "fill-opacity": 0.08 } });
          map.addLayer({ id: "public-geofence-outline", type: "line", source: "public-geofence", paint: { "line-color": "#0070f3", "line-width": 2 } });
        } else {
          const src = map.getSource("public-geofence") as maplibregl.GeoJSONSource;
          src.setData(geofence as unknown as GeoJSON.FeatureCollection);
        }
      };
      if (map.isStyleLoaded()) ensureGeofence(); else map.once("idle", ensureGeofence);
    }

    // courier moving marker
    let courierMarker: maplibregl.Marker | undefined;
    if (data.courier_last?.lat && data.courier_last?.lon) {
      courierMarker = new maplibregl.Marker({ color: "#111827" }).setLngLat([data.courier_last.lon, data.courier_last.lat]).addTo(map);
    }

    // subscribe to public realtime stream for this code
    const unsub = subscribeRealtime({ topics: [ `public:track:${code}` ], onMessage: (msg: unknown) => {
      if (typeof msg === "object" && msg !== null && "type" in msg && "data" in msg) {
        if (msg.type === "public.location") {
          const { lat, lon } = msg.data as { lat?: number; lon?: number } || {};
          if (typeof lat === "number" && typeof lon === "number") {
            if (!courierMarker) {
              courierMarker = new maplibregl.Marker({ color: "#111827" }).setLngLat([lon, lat]).addTo(map);
            } else {
              courierMarker.setLngLat([lon, lat]);
            }
          }
        }
        if (msg.type === "public.shipment") {
          setData((prev) => prev ? ({
            ...prev,
            shipment: {
              ...prev.shipment,
              status: (msg.data as { status?: string })?.status ?? prev.shipment.status,
              eta: (msg.data as { eta?: string })?.eta ?? prev.shipment.eta,
            }
          }) : prev);
        }
      }
    }});

    return () => { try { courierMarker?.remove(); } catch {} ; try { unsub?.(); } catch {} };
  }, [map, data, code]);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Seguimiento de tu pedido</h1>
      {data ? (
        <>
          <div className="border rounded p-3 text-sm">
            <p><b>Estado:</b> {data.shipment.status}</p>
            {data.shipment.eta && <p><b>ETA:</b> {new Date(data.shipment.eta).toLocaleString()}</p>}
            {data.destination && <p><b>Destino:</b> {data.destination.line1} {data.destination.city && `- ${data.destination.city}`}</p>}
          </div>
          <div ref={mapDiv} className="h-[380px] rounded overflow-hidden border" />
          <p className="text-xs text-gray-500">Este enlace es privado. No lo compartas.</p>
        </>
      ) : <p>Cargando...</p>}
    </div>
  );
}
