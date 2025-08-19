"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
// Removed useRequireAuth import - handled by (protected)/layout.tsx
import { useRouteManagement } from "@/hooks/routes/useRouteManagement";
import { useStopsDragDrop } from "@/hooks/routes/useStopsDragDrop";
import { useCouriers } from "@/hooks/couriers/useCouriers";
import { RouteHeader } from "@/components/routes/id/RouteHeader";
import { RouteMap } from "@/components/routes/id/RouteMap";
import { RouteInfo } from "@/components/routes/id/RouteInfo";
import { RouteActions } from "@/components/routes/id/RouteActions";
import { StopsTable } from "@/components/routes/id/StopsTable";

export default function RouteDetailPage() {
  const params = useParams<{ id: string }>();
  const routeId = params.id;
  
  const {
    route,
    stops,
    setStops,
    busy,
    msg,
    assignCourier,
    handleStartRoute,
    handleCompleteRoute,
    markStopCompleted,
    markStopFailed
  } = useRouteManagement(routeId);

  const { couriers, courierId, setCourierId } = useCouriers();
  
  const { onDragStart, onDragOver, onDrop } = useStopsDragDrop(
    routeId, 
    stops, 
    setStops
  );

  const orderedStops = useMemo(() => [...stops].sort((a, b) => a.sequence - b.sequence), [stops]);



  if (!route) return <div className="p-6">Cargando…</div>;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <RouteHeader title="Ruta" />

      <RouteMap stops={orderedStops} />

      <RouteInfo route={route} />

      <RouteActions
        courierId={courierId}
        setCourierId={setCourierId}
        couriers={couriers}
        onAssignCourier={() => assignCourier(courierId)}
        onStart={handleStartRoute}
        onComplete={handleCompleteRoute}
        busy={busy}
        message={msg}
      />

      <StopsTable
        stops={orderedStops}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onComplete={markStopCompleted}
        onFail={markStopFailed}
        busy={busy}
      />
    </div>
  );
}


