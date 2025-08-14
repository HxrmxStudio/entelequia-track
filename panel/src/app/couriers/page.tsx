"use client";
import { useEffect, useMemo, useState } from "react";
import type { Courier } from "@/services/couriers/types";
import { listCouriers } from "@/services/couriers/listCouriers";

export default function CouriersPage() {
  const [rows, setRows] = useState<Courier[]>([]);
  const [query, setQuery] = useState<string>("");
  const [activeOnly, setActiveOnly] = useState<boolean>(true);

  const filters = useMemo(() => ({ query, active: activeOnly }), [query, activeOnly]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await listCouriers(filters);
      if (mounted) setRows(data);
    })();
    return () => { mounted = false; };
  }, [filters]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Couriers</h1>
      <div className="flex gap-2 items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name/email"
          className="border rounded px-2 py-1"
        />
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={activeOnly} onChange={(e) => setActiveOnly(e.target.checked)} /> Active only
        </label>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Active</th>
            <th>Vehicle</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-b">
              <td className="py-2">{c.name}</td>
              <td>{c.email ?? "—"}</td>
              <td>{c.phone ?? "—"}</td>
              <td>{c.active ? "Yes" : "No"}</td>
              <td>{c.vehicle ?? "—"}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-gray-500">No couriers</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
