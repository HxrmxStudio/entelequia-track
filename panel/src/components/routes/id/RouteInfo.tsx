import type { RouteItem } from "@/services/routes/types";

interface RouteInfoProps {
  route: RouteItem;
}

export function RouteInfo({ route }: RouteInfoProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 text-sm space-y-1 bg-white shadow-sm text-gray-800">
      <div><b>ID:</b> {route.id}</div>
      <div><b>Nombre:</b> {route.name ?? "-"}</div>
      <div><b>Fecha:</b> {route.scheduled_date ?? "-"}</div>
      <div><b>Estado:</b> {route.status}</div>
      <div><b>Courier:</b> {route.courier?.name ?? "-"}</div>
      <div><b>Inició:</b> {route.started_at ? new Date(route.started_at).toLocaleString() : "-"}</div>
      <div><b>Completó:</b> {route.completed_at ? new Date(route.completed_at).toLocaleString() : "-"}</div>
    </div>
  );
}
