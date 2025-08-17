import type { OrderItem } from "@/services/orders/types";
import OrderRow from "./OrderRow";

interface OrdersTableProps {
  orders: ReadonlyArray<OrderItem>;
  loading: boolean;
}

export default function OrdersTable({ orders, loading }: OrdersTableProps) {
  return (
    <div className="overflow-auto border border-gray-200 rounded-lg bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50/80">
          <tr>
            <th className="text-left p-3">Order ID</th>
            <th className="text-left p-3">External Ref</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Amount</th>
            <th className="text-left p-3">Channel</th>
            <th className="text-left p-3">Delivery Window</th>
            <th className="text-left p-3">Created</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <OrderRow key={order.id} order={order} />
          ))}
          {orders.length === 0 && !loading && (
            <tr>
              <td className="p-6 text-gray-500" colSpan={8}>
                No results
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
