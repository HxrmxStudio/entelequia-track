import Link from "next/link";
import type { RouteItem } from "@/services/routes/types";

interface TableRowProps {
  route: RouteItem;
}

export function TableRow({ route }: TableRowProps) {
  return (
    <tr className="border-t border-gray-100 hover:bg-gray-50/60">
      <td className="p-3 font-mono text-gray-800">
        {String(route.id).slice(0, 8)}…
      </td>
      <td className="p-3">
        {route.scheduled_date ?? "-"}
      </td>
      <td className="p-3">
        {route.name ?? "-"}
      </td>
      <td className="p-3 capitalize">
        {route.status}
      </td>
      <td className="p-3">
        {route.courier?.name ?? "-"}
      </td>
      <td className="p-3">
        {route.stops?.length ?? 0}
      </td>
      <td className="p-3">
        <Link 
          href={`/routes/${route.id}`} 
          className="text-primary-700 hover:text-primary-800 underline"
        >
          Ver
        </Link>
      </td>
    </tr>
  );
}
