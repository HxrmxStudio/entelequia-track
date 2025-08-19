import { useCallback, useEffect, useState } from "react";
import { getRouteById } from "@/services/routes/getRouteById";
import { startRoute } from "@/services/routes/startRoute";
import { completeRoute } from "@/services/routes/completeRoute";
import { assignCourierToRoute } from "@/services/routes/assignCourierToRoute";
import type { RouteItem } from "@/services/routes/types";
import { listStops } from "@/services/stops/listStops";
import { completeStop } from "@/services/stops/completeStop";
import { failStop } from "@/services/stops/failStop";
import type { StopItem } from "@/services/stops/types";

export function useRouteManagement(routeId: string) {
  const [route, setRoute] = useState<RouteItem | null>(null);
  const [stops, setStops] = useState<StopItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await getRouteById(routeId);
    setRoute(r);
    const s = await listStops(routeId);
    setStops(s);
  }, [routeId]);

  const assignCourier = useCallback(async (courierId: string) => {
    if (!courierId) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await assignCourierToRoute(routeId, { courier_id: courierId });
      setRoute(r);
      setMsg("Courier asignado");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }, [routeId]);

  const handleStartRoute = useCallback(async () => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await startRoute(routeId);
      setRoute(r);
      setMsg("Ruta iniciada");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }, [routeId]);

  const handleCompleteRoute = useCallback(async () => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await completeRoute(routeId);
      setRoute(r);
      setMsg("Ruta completada");
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }, [routeId]);

  const markStopCompleted = useCallback(async (stopId: string) => {
    setBusy(true);
    setMsg(null);
    try {
      const s = await completeStop(routeId, stopId);
      setStops(prev => prev.map(x => x.id === s.id ? s : x));
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }, [routeId]);

  const markStopFailed = useCallback(async (stopId: string) => {
    const reason = prompt("Razón de fallo");
    if (!reason) return;
    setBusy(true);
    setMsg(null);
    try {
      const s = await failStop(routeId, stopId, { reason });
      setStops(prev => prev.map(x => x.id === s.id ? s : x));
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }, [routeId]);

  // Auto-load route data on mount
  useEffect(() => {
    void load();
  }, [load]);

  return {
    route,
    stops,
    setStops,
    busy,
    msg,
    load,
    assignCourier,
    handleStartRoute,
    handleCompleteRoute,
    markStopCompleted,
    markStopFailed
  };
}
