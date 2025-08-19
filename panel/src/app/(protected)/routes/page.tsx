"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { listRoutes } from "@/services/routes/listRoutes";
import type { RouteItem, RoutesFilter, RouteStatus } from "@/services/routes/types";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/routes/Header";
import { Filters } from "@/components/routes/Filters";
import { RoutesTable } from "@/components/routes/RoutesTable";


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
  // No need for useRequireAuth() - already protected by (protected)/layout.tsx
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
      <Header title="Rutas" />

      <Filters 
        filters={filters} 
        onChange={setFilters} 
        onRefresh={load} 
        loading={loading} 
      />

      <RoutesTable routes={rows} loading={loading} />
    </div>
  );
}


