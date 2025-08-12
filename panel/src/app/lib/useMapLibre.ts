"use client";
import { useEffect, useRef } from "react";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface UseMapLibreOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  center: [number, number];
  zoom: number;
  styleUrl?: string;
}

export function useMapLibre({ containerRef, center, zoom, styleUrl = "https://demotiles.maplibre.org/style.json" }: UseMapLibreOptions) {
  const mapRef = useRef<Map | null>(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleUrl,
      center,
      zoom
    });
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // Intentionally only depend on container and initial params; do not recreate map on prop changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef.current]);

  return { map: mapRef.current };
}


