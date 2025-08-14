"use client";

import { useEffect, useState } from "react";
import type { ShipmentsFilter, ShipmentStatus, DeliveryMethod } from "@/services/shipments/types";
import { CalendarDays, Filter, Truck, Search } from "lucide-react";

type Props = {
  filters: ShipmentsFilter;
  onChange: (next: ShipmentsFilter) => void;
  onRefresh: () => void;
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
};

export default function ShipmentFilters({ filters, onChange, onRefresh, loading, search, onSearchChange }: Props) {
  const [status, setStatus] = useState(filters.status ?? "");
  const [courierId, setCourierId] = useState(filters.courier_id ?? "");
  const [date, setDate] = useState<string>(filters.date ?? "");
  const [method, setMethod] = useState<DeliveryMethod | "">((filters as { delivery_method?: DeliveryMethod }).delivery_method ?? "");

  useEffect(() => { setStatus(filters.status ?? ""); }, [filters.status]);
  useEffect(() => { setCourierId(filters.courier_id ?? ""); }, [filters.courier_id]);
  useEffect(() => { setDate(filters.date ?? ""); }, [filters.date]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
      <div className="md:col-span-1">
        <label className="text-xs text-gray-600 flex items-center gap-1"><Search className="w-3.5 h-3.5"/> Search by tracking ID</label>
        <input className="border border-gray-300 bg-white rounded-md px-3 py-2 text-sm w-full" placeholder="ETQ-… / UUID" value={search} onChange={e=>onSearchChange(e.target.value)} />
      </div>
      <div className="md:col-span-1">
        <label className="text-xs text-gray-600 flex items-center gap-1"><Filter className="w-3.5 h-3.5"/> Status</label>
        <select className="border border-gray-300 bg-white rounded-md px-3 py-2 text-sm w-full" value={status} onChange={e=>setStatus(e.target.value as ShipmentStatus | "") }>
          <option value="">All Statuses</option>
          <option value="queued">Queued</option>
          <option value="out_for_delivery">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="failed">Failed</option>
          <option value="canceled">Canceled</option>
        </select>
      </div>
      <div className="md:col-span-1">
        <label className="text-xs text-gray-600 flex items-center gap-1"><Truck className="w-3.5 h-3.5"/> Method</label>
        <select className="border border-gray-300 bg-white rounded-md px-3 py-2 text-sm w-full" value={method} onChange={e=>setMethod(e.target.value as DeliveryMethod | "") }>
          <option value="">All Methods</option>
          <option value="courier">courier</option>
          <option value="pickup">pickup</option>
          <option value="carrier">carrier</option>
          <option value="other">other</option>
        </select>
      </div>
      <div className="md:col-span-1">
        <label className="text-xs text-gray-600 flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5"/> Date Range</label>
        <select className="border border-gray-300 bg-white rounded-md px-3 py-2 text-sm w-full" value={date} onChange={e=>setDate(e.target.value)}>
          <option value="">All Time</option>
          <option value="today">Today</option>
        </select>
      </div>
      <div className="md:col-span-1 flex gap-2">
        <button
          onClick={() => onChange({ status: (status || undefined) as ShipmentStatus | undefined, courier_id: courierId || undefined, date: (date || undefined) as unknown as "today" | undefined, ...(method ? { delivery_method: method } : {}) })}
          className="px-3 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >Apply</button>
        <button onClick={onRefresh} className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50">{loading ? "Loading..." : "Refresh"}</button>
        <button type="button" className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 hidden md:inline-flex"><Truck className="w-4 h-4 mr-2"/>More Filters</button>
      </div>
    </div>
  );
}


