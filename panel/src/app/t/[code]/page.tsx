"use client";
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { fetchPublicTrack } from "@/services/track/actionService";
import type { PublicTrack } from "@/services/track/types";
import { useMapLibre } from "@/app/lib/useMapLibre";

type PublicTrackPageProps = { params: Promise<{ code: string }> };

export default function PublicTrackPage({ params }: PublicTrackPageProps) {
  const mapDiv = useRef<HTMLDivElement|null>(null);
  const { map } = useMapLibre({
    containerRef: mapDiv,
    center: [ -58.3816, -34.6037 ],
    zoom: 12
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
    fetchPublicTrack(code)
      .then((payload: PublicTrack) => { if (isMounted) setData(payload); })
      .catch(() => { if (isMounted) setData(null); });
    return () => { isMounted = false; };
  }, [code]);

  useEffect(() => {
    if (!map || !data) return;
    if (data.destination?.lat && data.destination?.lon) {
      new maplibregl.Marker().setLngLat([data.destination.lon, data.destination.lat]).addTo(map);
      map.setCenter([data.destination.lon, data.destination.lat]);
    }
    if (data.courier_last?.lat && data.courier_last?.lon) {
      new maplibregl.Marker().setLngLat([data.courier_last.lon, data.courier_last.lat]).addTo(map);
    }
  }, [map, data]);

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
