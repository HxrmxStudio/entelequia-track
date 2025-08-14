"use client";
import { useEffect, useMemo, useState } from "react";
import { listShipments } from "@/services/shipments/listShipments";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import type { ShipmentsFilter, Shipment } from "@/services/shipments/types";
import ShipmentFilters from "@/components/shipments/ShipmentFilters";
import ShipmentList from "@/components/shipments/ShipmentList";

function useShipmentFilters(): [ShipmentsFilter, (f: ShipmentsFilter)=>void] {
  const [filters, setFilters] = useState<ShipmentsFilter>({});
  return [filters, setFilters];
}

export default function ShipmentsPage() {
  useRequireAuth();
  const [filters, setFilters] = useShipmentFilters();
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<ReadonlyArray<Shipment>>([]);
  const [loading, setLoading] = useState(false);

  const load = useMemo(() => {
    return async () => {
      setLoading(true);
      try {
        const data = await listShipments(filters);
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
        <h1 className="text-2xl font-semibold tracking-tight">Shipments</h1>
        <p className="text-sm text-gray-600">Browse and filter shipments</p>
      </header>

      <ShipmentFilters filters={filters} onChange={setFilters} onRefresh={load} loading={loading} search={search} onSearchChange={setSearch} />

      <ShipmentList items={rows} />
    </div>
  );
}
