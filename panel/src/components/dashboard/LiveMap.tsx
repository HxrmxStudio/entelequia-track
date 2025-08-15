"use client";

import { useEffect, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMapLibre } from "../../hooks/useMapLibre";
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
  // Use the same raster style that we already use in ShipmentMap to avoid vector style issues
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
  const { map } = useMapLibre({ containerRef: mapDiv, center: [initialCenter.lon, initialCenter.lat], zoom, style: rasterOSM });

  useEffect(() => { if (map) try { map.setMaxZoom(20); } catch {} }, [map]);

  // Keep an in-memory set of the latest courier positions and render via a clustered GeoJSON source
  const latestByCourierRef = useRef<Record<string, { lon: number; lat: number; ts?: string }>>({});
  const handlersBoundRef = useRef<boolean>(false);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  function toFeatureCollection(): GeoJSON.FeatureCollection<GeoJSON.Point, { id: string; ts?: string }> {
    const features: GeoJSON.Feature<GeoJSON.Point, { id: string; ts?: string }>[] = Object.entries(latestByCourierRef.current).map(
      ([id, pos]) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [pos.lon, pos.lat] },
        properties: { id, ts: pos.ts }
      })
    );
    return { type: "FeatureCollection", features };
  }

  useEffect(() => {
    if (!map) return;

    const ensureSourceAndLayers = () => {
      if (!map.getSource("couriers")) {
        map.addSource("couriers", {
          type: "geojson",
          data: toFeatureCollection(),
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        } as maplibregl.GeoJSONSourceOptions);

        map.addLayer({
          id: "courier-clusters",
          type: "circle",
          source: "couriers",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#51bbd6",
              50,
              "#f1f075",
              200,
              "#f28cb1"
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              14,
              50,
              20,
              200,
              28
            ]
          }
        });

        map.addLayer({
          id: "courier-cluster-count",
          type: "symbol",
          source: "couriers",
          filter: ["has", "point_count"],
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-size": 11
          },
          paint: { "text-color": "#111827" }
        });

        map.addLayer({
          id: "courier-unclustered",
          type: "circle",
          source: "couriers",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#111827",
            "circle-radius": 5,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#ffffff"
          }
        });
      }

      // Bind interactions once
      if (!handlersBoundRef.current) {
        handlersBoundRef.current = true;
        // Zoom into cluster on click
        map.on("click", "courier-clusters", (ev: maplibregl.MapLayerMouseEvent) => {
          const features = map.queryRenderedFeatures(ev.point, { layers: ["courier-clusters"] });
          if (!features.length) return;
          const f = features[0] as unknown as GeoJSON.Feature<GeoJSON.Point> & { properties?: Record<string, unknown> };
          const clusterId = (f.properties as Record<string, unknown>)?.cluster_id as number | undefined;
          const coordinates = (f.geometry as GeoJSON.Point)?.coordinates as [number, number];
          const src = map.getSource("couriers") as maplibregl.GeoJSONSource | undefined;
          if (src && typeof clusterId === "number") {
            try {
              const zoom = (src as maplibregl.GeoJSONSource & { getClusterExpansionZoom: (id: number) => number })?.getClusterExpansionZoom(clusterId);
              if (typeof zoom === "number") map.easeTo({ center: coordinates, zoom });
            } catch {}
          }
        });

        map.on("mouseenter", "courier-clusters", () => {
          try { map.getCanvas().style.cursor = "pointer"; } catch {}
        });
        map.on("mouseleave", "courier-clusters", () => {
          try { map.getCanvas().style.cursor = ""; } catch {}
        });

        // Hover popup for single courier points
        popupRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false });
        map.on("mouseenter", "courier-unclustered", (ev: maplibregl.MapLayerMouseEvent) => {
          try { map.getCanvas().style.cursor = "pointer"; } catch {}
          const feature = ev?.features?.[0] as GeoJSON.Feature<GeoJSON.Point> & { properties?: Record<string, unknown> };
          if (!feature) return;
          const coordinates = (feature.geometry?.coordinates as [number, number]);
          const id = feature.properties?.id as string | number | undefined;
          const ts = feature.properties?.ts as string | undefined;
          const tsStr = ts ? new Date(ts).toLocaleString() : "—";
          popupRef.current?.setLngLat(coordinates).setHTML(`<div>Courier #${id ?? "?"}</div><div>Last: ${tsStr}</div>`).addTo(map);
        });
        map.on("mouseleave", "courier-unclustered", () => {
          try { map.getCanvas().style.cursor = ""; } catch {}
          try { popupRef.current?.remove(); } catch {}
        });

        // Click on single courier: center and zoom in
        map.on("click", "courier-unclustered", (ev: maplibregl.MapLayerMouseEvent) => {
          const feature = ev?.features?.[0] as GeoJSON.Feature<GeoJSON.Point> | undefined;
          if (!feature || feature.geometry.type !== "Point") return;
          const coordinates = feature.geometry.coordinates as [number, number];
          const currentZoom = typeof map.getZoom === "function" ? map.getZoom() : 12;
          const targetZoom = currentZoom < 16 ? 16 : currentZoom + 0.5;
          try { map.easeTo({ center: coordinates, zoom: targetZoom }); } catch {}
        });
      }
    };

    if (map.isStyleLoaded()) ensureSourceAndLayers(); else map.once("idle", ensureSourceAndLayers);

    const unsub = subscribeRealtime((payload: unknown) => {
      const evt = payload as LiveMapEvent;
      if (evt?.type === "courier.location") {
        const d = evt.data;
        latestByCourierRef.current[d.courier_id] = { lon: d.lon, lat: d.lat, ts: d.ts };
        const src = map.getSource("couriers") as maplibregl.GeoJSONSource | undefined;
        if (src) {
          try { src.setData(toFeatureCollection()); } catch {}
        }
      }
      if (onEvent) onEvent(evt);
    });
    return () => { try { unsub?.(); } catch {} };
  }, [map, onEvent]);

  return <div ref={mapDiv} className="h-[500px] w-full rounded-lg overflow-hidden border" />;
}


