"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useRequireAuth } from "../../../../hooks/useRequireAuth";
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
import ShipmentMap from "@/components/shipments/ShipmentMap";
import { listCouriers } from "@/services/couriers/listCouriers";

export default function RouteDetailPage() {
  useRequireAuth();
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
      <h1 className="text-2xl font-semibold tracking-tight">Ruta</h1>

      {(() => {
        const firstWithCoords = orderedStops.find(s => typeof s.lat === "number" && typeof s.lon === "number");
        if (!firstWithCoords || firstWithCoords.lat == null || firstWithCoords.lon == null) return null;
        return (
          <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
            <ShipmentMap shipmentLocation={{ lat: firstWithCoords.lat, lon: firstWithCoords.lon }} geofenceRadiusM={150} />
          </div>
        );
      })()}

      <div className="border border-gray-200 rounded-lg p-4 text-sm space-y-1 bg-white shadow-sm text-gray-800">
        <div><b>ID:</b> {route.id}</div>
        <div><b>Nombre:</b> {route.name ?? "-"}</div>
        <div><b>Fecha:</b> {route.scheduled_date ?? "-"}</div>
        <div><b>Estado:</b> {route.status}</div>
        <div><b>Courier:</b> {route.courier?.name ?? "-"}</div>
        <div><b>Inició:</b> {route.started_at ? new Date(route.started_at).toLocaleString() : "-"}</div>
        <div><b>Completó:</b> {route.completed_at ? new Date(route.completed_at).toLocaleString() : "-"}</div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 text-sm space-y-3 bg-white shadow-sm text-gray-800">
        <h2 className="font-semibold">Acciones</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <select className="border border-gray-300 rounded-md px-3 py-2" value={courierId} onChange={e=>setCourierId(e.target.value)}>
            <option value="">Selecciona courier…</option>
            {couriers.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
          </select>
          <button disabled={busy || !courierId} onClick={doAssignCourier} className="px-3 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">Asignar courier</button>
          <button disabled={busy} onClick={doStart} className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">Iniciar</button>
          <button disabled={busy} onClick={doComplete} className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">Completar</button>
        </div>
        {msg && <p className="text-blue-700">{msg}</p>}
      </div>

      <div className="border border-gray-200 rounded-lg p-4 text-sm bg-white shadow-sm text-gray-800">
        <h2 className="font-semibold mb-2">Paradas</h2>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="text-left p-2">#</th>
                <th className="text-left p-2">Estado</th>
                <th className="text-left p-2">ETA</th>
                <th className="text-left p-2">Dirección</th>
                <th className="text-left p-2">Lat</th>
                <th className="text-left p-2">Lon</th>
                <th className="text-left p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orderedStops.map(s => (
                <tr key={s.id}
                    draggable
                    onDragStart={(e)=>onDragStart(e, s.id)}
                    onDragOver={onDragOver}
                    onDrop={(e)=>onDrop(e, s.id)}
                    className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-2">{s.sequence}</td>
                  <td className="p-2 capitalize">{s.status}</td>
                  <td className="p-2">{s.eta ? new Date(s.eta).toLocaleString() : "-"}</td>
                  <td className="p-2">{s.address ?? "-"}</td>
                  <td className="p-2">{s.lat ?? "-"}</td>
                  <td className="p-2">{s.lon ?? "-"}</td>
                  <td className="p-2 space-x-2">
                    <button disabled={busy} onClick={()=>markStopCompleted(s.id)} className="px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">Completar</button>
                    <button disabled={busy} onClick={()=>markStopFailed(s.id)} className="px-2 py-1 rounded-md border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50">Fallar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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


