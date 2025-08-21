import { formatStatusDisplayName } from "@/services/orders/utils";

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export default function OrderStatusBadge({ status, className = "" }: OrderStatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'placed':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready_for_delivery':
        return 'bg-purple-100 text-purple-800';
      case 'pending_payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'payment_failed':
        return 'bg-red-100 text-red-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'waiting':
        return 'bg-gray-100 text-gray-800';
      case 'ready_for_pickup':
        return 'bg-indigo-100 text-indigo-800';
      case 'payment_pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'received':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(status)} ${className}`}>
      {formatStatusDisplayName(status)}
    </span>
  );
}
