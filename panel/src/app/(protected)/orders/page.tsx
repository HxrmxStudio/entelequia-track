"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { listOrders } from "@/services/orders/listOrders";
import type { OrderItem, OrdersFilter } from "@/services/orders/types";
import { extractFilterOptions } from "@/services/orders/utils";
import { useSearchParams, useRouter } from "next/navigation";
import OrdersTable from "@/components/orders/OrdersTable";
import OrdersFilters from "@/components/orders/OrdersFilters";

function useOrderFilters(): [OrdersFilter, (next: OrdersFilter) => void] {
  const search = useSearchParams();
  const router = useRouter();
  const filters = useMemo<OrdersFilter>(() => {
    const status = search.get("status");
    const channel = search.get("channel");
    const amountRange = search.get("amount_range");
    
    return {
      status: status && status !== "undefined" && status !== "null" && status !== "" ? status : undefined,
      channel: channel && channel !== "undefined" && channel !== "null" && channel !== "" ? channel : undefined,
      amount_range: amountRange && amountRange !== "undefined" && amountRange !== "null" && amountRange !== "" ? (amountRange as 'low' | 'medium' | 'high') : undefined
    };
  }, [search]);
  
  const setFilters = (next: OrdersFilter) => {
    const params = new URLSearchParams();
    if (next.status) params.set("status", String(next.status));
    if (next.channel) params.set("channel", String(next.channel));
    if (next.amount_range) params.set("amount_range", String(next.amount_range));
    router.push(`/orders?${params.toString()}`);
  };
  
  return [filters, setFilters];
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
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

  // Extract filter options from the orders data
  const filterOptions = useMemo(() => extractFilterOptions(rows), [rows]);

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-gray-600">
          {loading ? "Loading..." : `${rows.length} orders`}
          {Object.keys(filters).some(key => filters[key as keyof OrdersFilter]) && (
            <span className="ml-2 text-blue-600">(filtered)</span>
          )}
        </p>
      </header>

      <OrdersFilters 
        filters={filters} 
        onChange={setFilters} 
        onRefresh={load} 
        loading={loading}
        filterOptions={filterOptions}
      />

      <OrdersTable orders={rows} loading={loading} />
    </div>
  );
}


