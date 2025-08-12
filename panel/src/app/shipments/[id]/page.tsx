"use client";
import { useCallback, useEffect, useState } from "react";
import { getShipmentById } from "@/services/shipments/getShipmentById";
import { postAssignShipment } from "@/services/shipments/postAssignShipment";
import { postRegenOtp } from "@/services/shipments/postRegenOtp";
import { useParams } from "next/navigation";
import type { ShipmentWithEvents } from "@/services/shipments/types";
import { useRequireAuth } from "@/app/lib/useRequireAuth";

export default function ShipmentDetailPage() {
  useRequireAuth();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [s, setS] = useState<ShipmentWithEvents | null>(null);
  const [courierId, setCourierId] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await getShipmentById(id);
    setS(data);
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  async function doAssign() {
    if (!courierId) return;
    setBusy(true); setMsg(null);
    try {
      await postAssignShipment(id, courierId);
      setMsg("Asignado correctamente");
      await load();
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    finally { setBusy(false); }
  }

  async function doRegenOtp() {
    setBusy(true); setMsg(null);
    try {
      await postRegenOtp(id);
      setMsg("OTP regenerado (enviado por el canal correspondiente)");
    } catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Error"); }
    finally { setBusy(false); }
  }

  function copyTracking() {
    if (!s) return;
    const url = `${window.location.origin}/t/${s.qr_token}`;
    navigator.clipboard.writeText(url);
    setMsg("Link copiado al portapapeles");
  }

  if (!s) return <div className="p-6">Cargando…</div>;

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold">Envío</h1>

      <div className="border rounded p-4 text-sm space-y-1">
        <div><b>ID:</b> {s.id}</div>
        <div><b>Order:</b> {s.order_id}</div>
        <div><b>Estado:</b> {s.status}</div>
        <div><b>Método:</b> {s.delivery_method}</div>
        <div><b>QR token:</b> {s.qr_token}</div>
        <div><b>ETA:</b> {s.eta ? new Date(s.eta).toLocaleString() : "-"}</div>
      </div>

      <div className="border rounded p-4 text-sm space-y-3">
        <h2 className="font-semibold">Acciones</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <input className="border p-2" placeholder="Courier UUID" value={courierId} onChange={e=>setCourierId(e.target.value)} />
          <button disabled={busy || !courierId} onClick={doAssign} className="px-3 py-2 rounded bg-black text-white">Asignar</button>
          <button disabled={busy} onClick={doRegenOtp} className="px-3 py-2 rounded border">Regenerar OTP</button>
          <button onClick={copyTracking} className="px-3 py-2 rounded border">Copiar link tracking</button>
        </div>
        {msg && <p className="text-blue-700">{msg}</p>}
      </div>

      <div className="border rounded p-4 text-sm">
        <h2 className="font-semibold mb-2">Timeline</h2>
        <ul className="space-y-1">
          {s.events?.length ? s.events.map((e)=>(
            <li key={e.id} className="flex gap-3">
              <span className="w-48 text-gray-600">{new Date(e.occurred_at).toLocaleString()}</span>
              <span className="font-mono">{e.type_key}</span>
            </li>
          )) : <li className="text-gray-500">Sin eventos</li>}
        </ul>
      </div>
    </div>
  );
}
