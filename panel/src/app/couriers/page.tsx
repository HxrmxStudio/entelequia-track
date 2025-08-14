"use client";
import { useEffect, useMemo, useState } from "react";
import { listCouriers } from "@/services/couriers/listCouriers";
import { createCourier } from "@/services/couriers/createCouriers";
import { destroyCourier } from "@/services/couriers/destroyCouriers";
import type { Courier } from "@/services/couriers/types";

export default function CouriersPage() {
  const [q, setQ] = useState("");
  const [active, setActive] = useState<boolean | undefined>(undefined);
  const [rows, setRows] = useState<Courier[]>([]);

  const load = useMemo(() => {
    return async () => {
      const data = await listCouriers({ query: q || undefined, active });
      setRows(data);
    };
  }, [q, active]);

  useEffect(() => { void load(); }, [load]);

  async function onCreate() {
    const name = prompt("Courier name");
    if (!name) return;
    try {
      await createCourier({ name, active: true });
      await load();
    } catch {}
  }

  async function onDelete(id: string) {
    if (!confirm("Delete courier?")) return;
    await destroyCourier(id);
    await load();
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">Couriers</h1>

      <div className="flex gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name/email/phone" className="border px-2 py-1 rounded"/>
        <select value={String(active)} onChange={e=>setActive(e.target.value === 'undefined' ? undefined : e.target.value === 'true')}>
          <option value="undefined">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button onClick={load} className="px-3 py-1 border rounded">Filter</button>
        <button onClick={onCreate} className="px-3 py-1 border rounded">+ Create</button>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Activo</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(c => (
            <tr key={c.id} className="border-b">
              <td className="py-2">{c.name}</td>
              <td>{c.email || '—'}</td>
              <td>{c.phone || '—'}</td>
              <td>{c.active ? 'Sí' : 'No'}</td>
              <td className="text-right">
                <button onClick={()=>onDelete(c.id)} className="px-2 py-1 border rounded">Eliminar</button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={5} className="py-6 text-center text-gray-500">Sin resultados</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
