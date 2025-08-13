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
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Envíos</h1>
      <div className="flex gap-3 items-center">
        <select className="border border-gray-300 bg-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">(todos)</option>
          <option value="queued">queued</option>
          <option value="out_for_delivery">out_for_delivery</option>
          <option value="delivered">delivered</option>
          <option value="failed">failed</option>
          <option value="canceled">canceled</option>
        </select>
        <button onClick={load} className="px-3 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 transition">{loading ? "Cargando..." : "Refrescar"}</button>
      </div>

      <div className="overflow-auto border border-gray-200 rounded-lg shadow-sm bg-white">
        <table className="w-full text-sm text-gray-800">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-700">ID</th>
              <th className="text-left p-3 font-semibold text-gray-700">Order</th>
              <th className="text-left p-3 font-semibold text-gray-700">Estado</th>
              <th className="text-left p-3 font-semibold text-gray-700">Método</th>
              <th className="text-left p-3 font-semibold text-gray-700">ETA</th>
              <th className="text-left p-3 font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                <td className="p-3 font-mono text-gray-800">{s.id.slice(0,8)}…</td>
                <td className="p-3 font-mono text-gray-800">{s.order_id?.slice?.(0,8)}…</td>
                <td className="p-3 capitalize">{s.status}</td>
                <td className="p-3">{s.delivery_method}</td>
                <td className="p-3">{s.eta ? new Date(s.eta).toLocaleString() : "-"}</td>
                <td className="p-3">
                  <Link href={`/shipments/${s.id}`} className="text-primary-700 hover:text-primary-800 underline">Ver</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td className="p-6 text-gray-500" colSpan={6}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
