import type { RouteItem } from "@/services/routes/types";
import { TableRow } from "./TableRow";
import { EmptyState } from "./EmptyState";

interface RoutesTableProps {
  routes: ReadonlyArray<RouteItem>;
  loading: boolean;
}

export function RoutesTable({ routes, loading }: RoutesTableProps) {
  return (
    <div className="overflow-auto border border-gray-200 rounded-lg shadow-sm bg-white">
      <table className="w-full text-sm text-gray-800">
        <thead className="bg-gray-50/80">
          <tr>
            <th className="text-left p-3 font-semibold text-gray-700">ID</th>
            <th className="text-left p-3 font-semibold text-gray-700">Fecha</th>
            <th className="text-left p-3 font-semibold text-gray-700">Nombre</th>
            <th className="text-left p-3 font-semibold text-gray-700">Estado</th>
            <th className="text-left p-3 font-semibold text-gray-700">Courier</th>
            <th className="text-left p-3 font-semibold text-gray-700"># Paradas</th>
            <th className="text-left p-3 font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => (
            <TableRow key={route.id} route={route} />
          ))}
          {routes.length === 0 && !loading && (
            <EmptyState colSpan={7} />
          )}
        </tbody>
      </table>
    </div>
  );
}
