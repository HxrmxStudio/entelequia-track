import Link from "next/link";
import type { OrderItem } from "@/services/orders/types";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderChannelBadge from "./OrderChannelBadge";
import OrderAmountDisplay from "./OrderAmountDisplay";
import OrderDeliveryWindow from "./OrderDeliveryWindow";

interface OrderRowProps {
  order: OrderItem;
}

export default function OrderRow({ order }: OrderRowProps) {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return { date: "-", time: "-" };
    
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date: createdDate, time: createdTime } = formatDate(order.created_at);

  return (
    <tr className="border-t hover:bg-gray-50">
      <td className="p-3">
        <div className="font-mono text-xs text-gray-600 break-all max-w-32">
          {order.id}
        </div>
      </td>
      <td className="p-3">
        <span className="font-medium">{order.external_ref ?? "-"}</span>
      </td>
      <td className="p-3">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="p-3">
        <OrderAmountDisplay amountCents={order.amount_cents} currency={order.currency} />
      </td>
      <td className="p-3">
        <OrderChannelBadge channel={order.channel} />
      </td>
      <td className="p-3">
        <OrderDeliveryWindow 
          startDate={order.delivery_window?.split("..")[0]} 
          endDate={order.delivery_window?.split("..")[1]} 
        />
      </td>
      <td className="p-3">
        <div className="text-xs">
          <div className="font-medium">{createdDate}</div>
          <div className="text-gray-500">{createdTime}</div>
        </div>
      </td>
      <td className="p-3">
        <Link 
          href={`/orders/${order.id}`} 
          className="text-primary-700 hover:text-primary-800 underline font-medium"
        >
          View Details
        </Link>
      </td>
    </tr>
  );
}
