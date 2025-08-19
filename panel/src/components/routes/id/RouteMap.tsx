import ShipmentMap from "@/components/shipments/ShipmentMap";

interface RouteMapProps {
  stops: Array<{ lat?: number | null; lon?: number | null }>;
}

export function RouteMap({ stops }: RouteMapProps) {
  const firstWithCoords = stops.find(s => typeof s.lat === "number" && typeof s.lon === "number");
  
  if (!firstWithCoords || firstWithCoords.lat == null || firstWithCoords.lon == null) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <ShipmentMap 
        shipmentLocation={{ lat: firstWithCoords.lat, lon: firstWithCoords.lon }} 
        geofenceRadiusM={150} 
      />
    </div>
  );
}
