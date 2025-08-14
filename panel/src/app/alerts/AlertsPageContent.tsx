"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { listAlerts } from "@/services/alerts/list";
import { resolveAlert } from "@/services/alerts/resolve";
import type { Alert, AlertFilters } from "@/services/alerts/types";
import { subscribeToAlerts } from "@/services/alerts/subscribe";
import { toast } from "sonner";
import Link from "next/link";
import { computeSeverity, severityClass } from "@/services/alerts/severity";

export default function AlertsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState<Alert[]>([]);

  const filters: AlertFilters = useMemo(() => {
    const status = searchParams.get("status") ?? "open";
    const type = searchParams.get("type") ?? undefined;
    const resource_type = searchParams.get("resource_type") ?? undefined;
    const resource_id = searchParams.get("resource_id") ?? undefined;
    const since = searchParams.get("since") ?? undefined;
    const limitStr = searchParams.get("limit");
    const limit = limitStr ? Number(limitStr) : undefined;
    return {
      status: status as AlertFilters["status"],
      type: type || undefined,
      resource_type: resource_type as AlertFilters["resource_type"],
      resource_id: resource_id ?? undefined,
      since,
      limit,
    };
  }, [searchParams]);

  function updateQuery(next: Partial<AlertFilters>) {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") sp.delete(k);
      else sp.set(k, String(v));
    });
    if (!sp.get("status")) sp.set("status", "open");
    router.replace(`?${sp.toString()}`);
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await listAlerts(filters);
      if (mounted) setRows(data);
    })();
    return () => {
      mounted = false;
    };
  }, [filters]);

  useEffect(() => {
    // subscribe to realtime alerts with idempotent handlers
    const unsubscribe = subscribeToAlerts({
      onAlert: (a) => {
        // match current filters
        if (!matchesFilters(a, filters)) return;
        setRows((prev) => dedupeAndInsert(prev, a));
      },
      onResolved: (id) => {
        setRows((prev) => prev.filter((p) => p.id !== id));
      },
    });
    return () => unsubscribe();
  }, [filters]);

  async function onResolve(id: number | string) {
    try {
      // optimistic update
      setRows((prev) => prev.filter((p) => p.id !== id));
      await resolveAlert(id, "ack by ops");
      toast.success("Alerta resuelta");
    } catch (e: unknown) {
      // rollback by reloading
      const data = await listAlerts(filters);
      setRows(data);
      const message = e instanceof Error ? e.message : "Unknown error";
      toast.error(`Error resolviendo: ${message}`);
    }
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">SLA Alerts</h1>
      <div className="flex gap-2 items-center">
        <select
          value={filters.type ?? ""}
          onChange={(e) => updateQuery({ type: e.target.value || undefined })}
          className="border rounded px-2 py-1"
        >
          <option value="">Todas</option>
          <option value="gps_offline">GPS Offline</option>
          <option value="eta_delay">ETA Delay</option>
        </select>
        <select
          value={filters.status ?? "open"}
          onChange={(e) => updateQuery({ status: (e.target.value as AlertFilters["status"]) || undefined })}
          className="border rounded px-2 py-1"
        >
          <option value="open">Abiertas</option>
          <option value="resolved">Resueltas</option>
        </select>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Sev</th>
            <th>Tipo</th>
            <th>Recurso</th>
            <th>Creada</th>
            <th>Resuelta</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id} className="border-b">
              <td className="py-2">
                {(() => {
                  const sev = computeSeverity(a);
                  return <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs ${severityClass(sev)}`}>{sev}</span>;
                })()}
              </td>
              <td>{a.type}</td>
              <td>
                {a.type === "eta_delay" || a.type === "shipment_delayed" ? (
                  a.resource.type === "Shipment" && a.resource.id ? (
                    <Link className="text-emerald-700 hover:underline" href={`/shipments/${a.resource.id}`}>
                      Shipment #{a.resource.id}
                    </Link>
                  ) : (
                    <span>{a.resource.type}{a.resource.id ? ` #${a.resource.id}` : ""}</span>
                  )
                ) : (
                  <span>{a.resource.type}{a.resource.id ? ` #${a.resource.id}` : ""}</span>
                )}
              </td>
              <td>{a.created_at ? new Date(a.created_at).toLocaleString() : "—"}</td>
              <td>{a.resolved_at ? new Date(a.resolved_at).toLocaleString() : "—"}</td>
              <td className="text-right">
                {a.status === "open" && (
                  <button onClick={() => onResolve(a.id)} className="px-2 py-1 border rounded">
                    Resolver
                  </button>
                )}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-gray-500">
                Sin alertas
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function matchesFilters(a: Alert, f: AlertFilters): boolean {
  if (f.status && a.status !== f.status) return false;
  if (f.type && a.type !== f.type) return false;
  if (f.resource_type && a.resource.type !== f.resource_type) return false;
  if (f.resource_id && String(a.resource.id ?? "") !== String(f.resource_id)) return false;
  if (f.since && a.created_at && new Date(a.created_at) < new Date(f.since)) return false;
  return true;
}

function dedupeAndInsert(list: Alert[], next: Alert): Alert[] {
  const existingIndex = list.findIndex((x) => x.id === next.id);
  const updated = existingIndex >= 0 ? list.map((x) => (x.id === next.id ? next : x)) : [next, ...list];
  // order by created_at desc when available
  return [...updated].sort((a, b) => {
    const ta = a.created_at ? Date.parse(a.created_at) : 0;
    const tb = b.created_at ? Date.parse(b.created_at) : 0;
    return tb - ta;
  });
}
