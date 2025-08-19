"use client";

import { useEffect, useState } from "react";
import type { RoutesFilter } from "@/services/routes/types";

interface FiltersProps {
  filters: RoutesFilter;
  onChange: (f: RoutesFilter) => void;
  onRefresh: () => void;
  loading: boolean;
}

export function Filters({ filters, onChange, onRefresh, loading }: FiltersProps) {
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
        <input 
          type="date" 
          className="border border-gray-300 bg-white rounded-md px-3 py-2 text-sm" 
          value={date} 
          onChange={e => setDate(e.target.value)} 
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-600">Courier ID</label>
        <input 
          className="border border-gray-300 bg-white rounded-md px-3 py-2 text-sm" 
          placeholder="UUID" 
          value={courierId} 
          onChange={e => setCourierId(e.target.value)} 
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-600">Estado</label>
        <select 
          className="border border-gray-300 bg-white rounded-md px-3 py-2 text-sm" 
          value={status} 
          onChange={e => setStatus(e.target.value)}
        >
          <option value="">(todos)</option>
          <option value="planned">planned</option>
          <option value="in_progress">in_progress</option>
          <option value="completed">completed</option>
        </select>
      </div>
      <button
        onClick={() => onChange({ 
          date: date || undefined, 
          courier_id: courierId || undefined, 
          status: status || undefined 
        })}
        className="px-3 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700"
      >
        Aplicar
      </button>
      <button 
        onClick={onRefresh} 
        className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
      >
        {loading ? "Cargando..." : "Refrescar"}
      </button>
    </div>
  );
}
