"use client";
import { useEffect, useMemo, useRef } from "react";
import maplibregl from "maplibre-gl";
import * as turf from "@turf/turf";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMapLibre } from "../../../hooks/useMapLibre";

type Props = {
  shipmentLocation: { lat: number; lon: number };
  geofenceRadiusM: number;
  podLocation?: { lat: number; lon: number };
};

export default function ShipmentMap({ shipmentLocation, geofenceRadiusM, podLocation }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
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
    containerRef,
    center: [shipmentLocation.lon, shipmentLocation.lat],
    zoom: 15,
    style: rasterOSM
  });
  useEffect(() => { if (map) try { map.setMaxZoom(20); } catch {} }, [map]);

  const geofenceGeoJson = useMemo(() => (
    turf.circle([shipmentLocation.lon, shipmentLocation.lat], geofenceRadiusM / 1000, { steps: 64, units: "kilometers" })
  ), [shipmentLocation.lat, shipmentLocation.lon, geofenceRadiusM]);

  // add or update sources/layers and markers
  useEffect(() => {
    if (!map) return;
    console.log("[map] layers effect start", { center: shipmentLocation, radius: geofenceRadiusM });
    // center marker
    const centerMarker = new maplibregl.Marker({ color: "#0070f3" })
      .setLngLat([shipmentLocation.lon, shipmentLocation.lat])
      .setPopup(new maplibregl.Popup().setText("Ubicación de entrega"))
      .addTo(map);

    const ensureGeofence = () => {
      console.log("[map] ensureGeofence");
      if (!map.getSource("geofence")) {
        console.log("[map] addSource geofence");
        map.addSource("geofence", { type: "geojson", data: geofenceGeoJson as unknown as GeoJSON.FeatureCollection });
        console.log("[map] addLayer geofence-fill");
        map.addLayer({ id: "geofence-fill", type: "fill", source: "geofence", paint: { "fill-color": "#0070f3", "fill-opacity": 0.1 } });
        console.log("[map] addLayer geofence-outline");
        map.addLayer({ id: "geofence-outline", type: "line", source: "geofence", paint: { "line-color": "#0070f3", "line-width": 2 } });
      } else {
        console.log("[map] update geofence data");
        const src = map.getSource("geofence") as maplibregl.GeoJSONSource;
        src.setData(geofenceGeoJson as unknown as GeoJSON.FeatureCollection);
      }
    };

    // style may reload; prefer 'idle' after style/setStyle
    if (map.isStyleLoaded()) ensureGeofence(); else map.once("idle", ensureGeofence);

    let podMarker: maplibregl.Marker | undefined;
    if (podLocation) {
      console.log("[map] add pod marker", podLocation);
      podMarker = new maplibregl.Marker({ color: "#FF0000" })
        .setLngLat([podLocation.lon, podLocation.lat])
        .setPopup(new maplibregl.Popup().setText("Ubicación del POD"))
        .addTo(map);
    }

    return () => {
      console.log("[map] cleanup markers");
      centerMarker.remove();
      if (podMarker) podMarker.remove();
    };
  }, [map, shipmentLocation, geofenceGeoJson, podLocation, geofenceRadiusM]);

  return <div ref={containerRef} className="w-full h-[400px]" />;
}
