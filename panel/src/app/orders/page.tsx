"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { listOrders } from "@/services/orders/listOrders";
import type { OrderItem, OrdersFilter } from "@/services/orders/types";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useRequireAuth } from "../../../hooks/useRequireAuth";

function useOrderFilters(): [OrdersFilter, (next: OrdersFilter) => void] {
  const search = useSearchParams();
  const router = useRouter();
  const filters = useMemo<OrdersFilter>(() => {
    const raw = search.get("status");
    const status = raw && raw !== "undefined" && raw !== "null" && raw !== "" ? raw : undefined;
    return { status };
  }, [search]);
  const setFilters = (next: OrdersFilter) => {
    const params = new URLSearchParams();
    if (next.status) params.set("status", String(next.status));
    router.push(`/orders?${params.toString()}`);
  };
  return [filters, setFilters];
}

export default function OrdersPage() {
  useRequireAuth();
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Loading…</div>}>
      <OrdersInner />
    </Suspense>
  );
}

function OrdersInner() {
  const [filters, setFilters] = useOrderFilters();
  const [rows, setRows] = useState<ReadonlyArray<OrderItem>>([]);
  const [loading, setLoading] = useState(false);

  const load = useMemo(() => {
    return async () => {
      setLoading(true);
      try {
        const data = await listOrders(filters);
        setRows(data);
      } finally {
        setLoading(false);
      }
    };
  }, [filters]);

  useEffect(() => { void load(); }, [load]);

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-gray-600">Latest 100 orders</p>
      </header>

      <Filters filters={filters} onChange={setFilters} onRefresh={load} loading={loading} />

      <div className="overflow-auto border border-gray-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="text-left p-3">ID</th>
              <th className="text-left p-3">External Ref</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Channel</th>
              <th className="text-left p-3">Created</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(o => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono">{String(o.id).slice(0,8)}…</td>
                <td className="p-3">{o.external_ref ?? "-"}</td>
                <td className="p-3 capitalize">{o.status}</td>
                <td className="p-3">{o.amount_cents != null ? `$${(o.amount_cents/100).toFixed(2)} ${o.currency ?? ""}` : "-"}</td>
                <td className="p-3">{o.channel ?? "-"}</td>
                <td className="p-3">{o.created_at ? new Date(o.created_at).toLocaleString() : "-"}</td>
                <td className="p-3"><Link href={`/orders/${o.id}`} className="text-primary-700 underline">View</Link></td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td className="p-6 text-gray-500" colSpan={7}>No results</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Filters({ filters, onChange, onRefresh, loading }: { filters: OrdersFilter; onChange: (f: OrdersFilter)=>void; onRefresh: ()=>void; loading: boolean }) {
  const [status, setStatus] = useState(String(filters.status ?? ""));
  useEffect(() => { setStatus(String(filters.status ?? "")); }, [filters.status]);
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col">
        <label className="text-xs text-gray-600">Status</label>
        <select className="border border-gray-300 bg-white rounded-md px-3 py-2 text-sm" value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">(all)</option>
          <option value="received">received</option>
          <option value="draft">draft</option>
          <option value="placed">placed</option>
          <option value="confirmed">confirmed</option>
          <option value="fulfilled">fulfilled</option>
          <option value="canceled">canceled</option>
        </select>
      </div>
      <button onClick={()=>onChange({ status: status || undefined })} className="px-3 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700">Apply</button>
      <button onClick={onRefresh} className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50">{loading ? "Loading..." : "Refresh"}</button>
    </div>
  );
}


