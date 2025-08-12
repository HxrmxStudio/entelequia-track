"use client";
import { useEffect, useMemo, useState } from "react";
import { listShipments } from "@/services/shipments/listShipments";
import Link from "next/link";
import { useRequireAuth } from "@/app/lib/useRequireAuth";

export default function ShipmentsPage() {
  useRequireAuth();
  const [rows, setRows] = useState<ReadonlyArray<{ id: string; order_id?: string; status: string; delivery_method: string; eta?: string | null }>>([]);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const load = useMemo(() => {
    return async () => {
      setLoading(true);
      try {
        const data = await listShipments({ status });
        setRows(data.map(s => ({ id: s.id, order_id: s.order_id, status: s.status, delivery_method: s.delivery_method, eta: s.eta })));
      } finally {
        setLoading(false);
      }
    };
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="p-6 space-y-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold">Envíos</h1>
      <div className="flex gap-3 items-center">
        <select className="border p-2" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">(todos)</option>
          <option value="queued">queued</option>
          <option value="out_for_delivery">out_for_delivery</option>
          <option value="delivered">delivered</option>
          <option value="failed">failed</option>
          <option value="canceled">canceled</option>
        </select>
        <button onClick={load} className="px-3 py-2 border rounded">{loading ? "Cargando..." : "Refrescar"}</button>
      </div>

      <div className="overflow-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Order</th>
              <th className="text-left p-2">Estado</th>
              <th className="text-left p-2">Método</th>
              <th className="text-left p-2">ETA</th>
              <th className="text-left p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2">{s.id.slice(0,8)}…</td>
                <td className="p-2">{s.order_id?.slice?.(0,8)}…</td>
                <td className="p-2">{s.status}</td>
                <td className="p-2">{s.delivery_method}</td>
                <td className="p-2">{s.eta ? new Date(s.eta).toLocaleString() : "-"}</td>
                <td className="p-2">
                  <Link href={`/shipments/${s.id}`} className="text-blue-600 underline">Ver</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td className="p-4 text-gray-500" colSpan={6}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
