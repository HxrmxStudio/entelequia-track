"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
// Removed useRequireAuth import - handled by (protected)/layout.tsx
import { getRouteById } from "@/services/routes/getRouteById";
import { startRoute } from "@/services/routes/startRoute";
import { completeRoute } from "@/services/routes/completeRoute";
import { assignCourierToRoute } from "@/services/routes/assignCourierToRoute";
import type { RouteItem } from "@/services/routes/types";
import { listStops } from "@/services/stops/listStops";
import { resequenceStops } from "@/services/stops/resequenceStops";
import { completeStop } from "@/services/stops/completeStop";
import { failStop } from "@/services/stops/failStop";
import type { StopItem } from "@/services/stops/types";
import { listCouriers } from "@/services/couriers/listCouriers";
import { RouteHeader } from "@/components/routes/id/RouteHeader";
import { RouteMap } from "@/components/routes/id/RouteMap";
import { RouteInfo } from "@/components/routes/id/RouteInfo";
import { RouteActions } from "@/components/routes/id/RouteActions";
import { StopsTable } from "@/components/routes/id/StopsTable";

export default function RouteDetailPage() {
  // No need for useRequireAuth() - already protected by (protected)/layout.tsx
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [route, setRoute] = useState<RouteItem | null>(null);
  const [stops, setStops] = useState<StopItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [courierId, setCourierId] = useState("");
  const [couriers, setCouriers] = useState<ReadonlyArray<{ id: string; name: string }>>([]);

  const load = useCallback(async () => {
    const r = await getRouteById(id);
    setRoute(r);
    const s = await listStops(id);
    setStops(s);
  }, [id]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { (async () => { try { const cs = await listCouriers({ active: true }); setCouriers(cs); } catch {} })(); }, []);

  // simplistic drag & drop using HTML5 API
  const [dragId, setDragId] = useState<string | null>(null);
  const orderedStops = useMemo(() => [...stops].sort((a, b) => a.sequence - b.sequence), [stops]);

  function onDragStart(e: React.DragEvent<HTMLTableRowElement>, sid: string) {
    setDragId(sid);
    e.dataTransfer.setData("text/plain", sid);
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragOver(e: React.DragEvent<HTMLTableRowElement>) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }
  async function onDrop(e: React.DragEvent<HTMLTableRowElement>, targetId: string) {
    e.preventDefault();
    const sourceId = dragId || e.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === targetId) return;
    const newOrder = reorder(orderedStops.map(s => s.id), sourceId, targetId);
    setBusy(true); setMsg(null);
    try {
      const updated = await resequenceStops(id, { order: newOrder });
      setStops(updated);
      setMsg("Orden actualizado");
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    finally { setBusy(false); setDragId(null); }
  }

  async function doAssignCourier() {
    if (!courierId) return;
    setBusy(true); setMsg(null);
    try { const r = await assignCourierToRoute(id, { courier_id: courierId }); setRoute(r); setMsg("Courier asignado"); }
    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    finally { setBusy(false); }
  }

  async function doStart() { setBusy(true); setMsg(null); try { const r = await startRoute(id); setRoute(r); setMsg("Ruta iniciada"); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } finally { setBusy(false); } }
  async function doComplete() { setBusy(true); setMsg(null); try { const r = await completeRoute(id); setRoute(r); setMsg("Ruta completada"); } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); } finally { setBusy(false); } }

  async function markStopCompleted(stopId: string) {
    setBusy(true); setMsg(null);
    try { const s = await completeStop(id, stopId); setStops(prev => prev.map(x => x.id === s.id ? s : x)); }
    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    finally { setBusy(false); }
  }
  async function markStopFailed(stopId: string) {
    const reason = prompt("Razón de fallo");
    if (!reason) return;
    setBusy(true); setMsg(null);
    try { const s = await failStop(id, stopId, { reason }); setStops(prev => prev.map(x => x.id === s.id ? s : x)); }
    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    finally { setBusy(false); }
  }

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
        onAssignCourier={doAssignCourier}
        onStart={doStart}
        onComplete={doComplete}
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

function reorder(ids: string[], sourceId: string, targetId: string): string[] {
  const from = ids.indexOf(sourceId);
  const to = ids.indexOf(targetId);
  if (from === -1 || to === -1) return ids;
  const copy = ids.slice();
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return copy;
}


