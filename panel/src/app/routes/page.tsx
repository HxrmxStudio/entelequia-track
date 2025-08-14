"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { listRoutes } from "@/services/routes/listRoutes";
import type { RouteItem, RoutesFilter, RouteStatus } from "@/services/routes/types";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useRequireAuth } from "../../../hooks/useRequireAuth";

function useFiltersFromSearch(): [RoutesFilter, (next: RoutesFilter) => void] {
  const search = useSearchParams();
  const router = useRouter();
  const filters: RoutesFilter = useMemo(() => ({
    date: search.get("date") || undefined,
    courier_id: search.get("courier_id") || undefined,
    status: (search.get("status") as RouteStatus | string | null) || undefined
  }), [search]);
  const setFilters = (next: RoutesFilter) => {
    const params = new URLSearchParams();
    if (next.date) params.set("date", next.date);
    if (next.courier_id) params.set("courier_id", next.courier_id);
    if (next.status) params.set("status", String(next.status));
    router.push(`/routes?${params.toString()}`);
  };
  return [filters, setFilters];
}

export default function RoutesPage() {
  useRequireAuth();
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading…</div>}>
      <RoutesInner />
    </Suspense>
  );
}

function RoutesInner() {
  const [filters, setFilters] = useFiltersFromSearch();
  const [rows, setRows] = useState<ReadonlyArray<RouteItem>>([]);
  const [loading, setLoading] = useState(false);

  const load = useMemo(() => {
    return async () => {
      setLoading(true);
      try {
        const data = await listRoutes(filters);
        setRows(data);
      } finally {
        setLoading(false);
      }
    };
  }, [filters]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight">Rutas</h1>

      <Filters filters={filters} onChange={setFilters} onRefresh={load} loading={loading} />

      <div className="overflow-auto border border-gray-200 rounded-lg shadow-sm bg-white">
        <table className="w-full text-sm text-gray-800">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="text-left p-3 font-semibold text-gray-700">ID</th>
              <th className="text-left p-3 font-semibold text-gray-700">Fecha</th>
              <th className="text-left p-3 font-semibold text-gray-700">Nombre</th>
              <th className="text-left p-3 font-semibold text-gray-700">Estado</th>
              <th className="text-left p-3 font-semibold text-gray-700">Courier</th>
              <th className="text-left p-3 font-semibold text-gray-700"># Paradas</th>
              <th className="text-left p-3 font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                <td className="p-3 font-mono text-gray-800">{String(r.id).slice(0,8)}…</td>
                <td className="p-3">{r.scheduled_date ?? "-"}</td>
                <td className="p-3">{r.name ?? "-"}</td>
                <td className="p-3 capitalize">{r.status}</td>
                <td className="p-3">{r.courier?.name ?? "-"}</td>
                <td className="p-3">{r.stops?.length ?? 0}</td>
                <td className="p-3">
                  <Link href={`/routes/${r.id}`} className="text-primary-700 hover:text-primary-800 underline">Ver</Link>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td className="p-6 text-gray-500" colSpan={7}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Filters({ filters, onChange, onRefresh, loading }: { filters: RoutesFilter; onChange: (f: RoutesFilter) => void; onRefresh: () => void; loading: boolean }) {
  const [date, setDate] = useState(filters.date ?? "");
  const [courierId, setCourierId] = useState(filters.courier_id ?? "");
  const [status, setStatus] = useState(String(filters.status ?? ""));

  useEffect(() => { setDate(filters.date ?? ""); }, [filters.date]);
  useEffect(() => { setCourierId(filters.courier_id ?? ""); }, [filters.courier_id]);
  useEffect(() => { setStatus(String(filters.status ?? "")); }, [filters.status]);

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex flex-col">
        <label className="text-xs text-gray-600">Fecha</label>
        <input type="date" className="border border-gray-300 bg-white rounded-md px-3 py-2 text-sm" value={date} onChange={e=>setDate(e.target.value)} />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-600">Courier ID</label>
        <input className="border border-gray-300 bg-white rounded-md px-3 py-2 text-sm" placeholder="UUID" value={courierId} onChange={e=>setCourierId(e.target.value)} />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-600">Estado</label>
        <select className="border border-gray-300 bg-white rounded-md px-3 py-2 text-sm" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">(todos)</option>
          <option value="pending">pending</option>
          <option value="in_progress">in_progress</option>
          <option value="completed">completed</option>
        </select>
      </div>
      <button
        onClick={() => onChange({ date: date || undefined, courier_id: courierId || undefined, status: status || undefined })}
        className="px-3 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700"
      >Aplicar</button>
      <button onClick={onRefresh} className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50">{loading ? "Cargando..." : "Refrescar"}</button>
    </div>
  );
}


