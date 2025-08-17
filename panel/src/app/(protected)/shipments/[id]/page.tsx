"use client";
import { useCallback, useEffect, useState } from "react";
import { getShipmentById } from "@/services/shipments/getShipmentById";
import { postAssignShipment } from "@/services/shipments/postAssignShipment";
import { postRegenOtp } from "@/services/shipments/postRegenOtp";
import { useParams } from "next/navigation";
import type { ShipmentWithEvents } from "@/services/shipments/types";
// Removed useRequireAuth import - handled by (protected)/layout.tsx
import ProofButton from "@/components/proofs/ProofButton";
import ShipmentMap from "@/components/shipments/ShipmentMap";
import { useShipmentRealtime, type ProofCreated } from "@/hooks/useShipmentRealtime";
import CourierAssignment from "@/components/shipments/CourierAssignment";

export default function ShipmentDetailPage() {
  // No need for useRequireAuth() - already protected by (protected)/layout.tsx
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [s, setS] = useState<ShipmentWithEvents | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await getShipmentById(id);
    setS(data);
  }, [id]);
  useEffect(() => { void load(); }, [load]);

  useShipmentRealtime(id, {
    onProofCreated: async (evt: ProofCreated) => {
      // si el evento es del mismo shipment, refrescamos la vista
      if (String(evt.shipment_id) === String(id)) {
        await load();
      }
    }
  });

  async function doAssign(courierId: string) {
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
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Envío</h1>

      <div className="border border-gray-200 rounded-lg p-6 text-sm space-y-3 bg-white shadow-sm text-gray-800">
        <h2 className="text-lg font-semibold mb-4">Shipment Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Basic Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="font-medium text-gray-600 w-24">Tracking ID:</span>
              <span className="font-mono text-gray-900 break-all">{s.id}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-medium text-gray-600 w-24">Order ID:</span>
              <span className="font-mono text-gray-900 break-all">{s.order_id}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-600 w-24">Status:</span>
              <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium capitalize">{s.status}</span>
            </div>
          </div>
          
          {/* Right Column: Delivery & Courier Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-600 w-24">Method:</span>
              <span className="capitalize">{s.delivery_method}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-medium text-gray-600 w-24">QR Token:</span>
              <span className="font-mono text-gray-900 break-all">{s.qr_token}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-600 w-24">ETA:</span>
              <span>{s.eta ? new Date(s.eta).toLocaleString() : "Not set"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-600 w-24">Courier:</span>
              <span className={s.assigned_courier ? "text-green-600 font-medium" : "text-gray-500"}>
                {s.assigned_courier ? s.assigned_courier.name : "Not assigned"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Courier Assignment Section */}
      {s.assigned_courier && (
        <div className="border border-gray-200 rounded-lg p-6 text-sm space-y-3 bg-white shadow-sm text-gray-800">
          <h2 className="text-lg font-semibold mb-4">Assigned Courier</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-600 w-24">Name:</span>
                <span className="font-semibold text-gray-900">{s.assigned_courier.name}</span>
              </div>
              {s.assigned_courier.email && (
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-600 w-24">Email:</span>
                  <span className="text-gray-900">{s.assigned_courier.email}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {s.assigned_courier.phone && (
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-600 w-24">Phone:</span>
                  <span className="text-gray-900">{s.assigned_courier.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg p-4 text-sm space-y-3 bg-white shadow-sm text-gray-800">
        <h2 className="font-semibold">Acciones</h2>
        <div className="space-y-4">
          <CourierAssignment
            currentCourierId={s.assigned_courier?.id}
            onAssign={doAssign}
            disabled={busy}
          />
          
          <div className="flex flex-wrap gap-2 items-center">
            <button disabled={busy} onClick={doRegenOtp} className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">Regenerar OTP</button>
            <button onClick={copyTracking} className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50">Copiar link tracking</button>
            <ProofButton shipmentId={id} onCreated={() => { void load(); }} />
          </div>
        </div>
        {msg && <p className="text-blue-700">{msg}</p>}
      </div>

      <div className="border border-gray-200 rounded-lg p-4 text-sm bg-white shadow-sm text-gray-800">
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
      <ShipmentMap
        shipmentLocation={{ lat: -34.6037, lon: -58.3816 }}
        geofenceRadiusM={150}
        podLocation={undefined}
      />
    </div>
  );
}
