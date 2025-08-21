import type { OrderItem, FilterOptions } from "./types";

/**
 * Extracts unique filter options from orders data
 * @param orders - Array of orders to extract options from
 * @returns Object containing unique statuses and channels
 */
export function extractFilterOptions(orders: readonly OrderItem[]): FilterOptions {
  const uniqueStatuses = [...new Set(orders.map(order => order.status))].sort();
  const uniqueChannels = [...new Set(
    orders
      .map(order => order.channel)
      .filter((channel): channel is string => channel != null)
  )].sort();
  
  return {
    statuses: uniqueStatuses,
    channels: uniqueChannels
  };
}

/**
 * Formats channel display names for better readability
 * @param channel - Raw channel value from API
 * @returns Formatted display name
 */
export function formatChannelDisplayName(channel: string): string {
  const channelMap: Record<string, string> = {
    'mercado_libre': 'Mercado Libre',
    'correo_sucursal': 'Correo Sucursal',
    'sucursal_centro': 'Sucursal Centro',
    'sucursal': 'Sucursal',
    'andreani': 'Andreani',
    'mismo_dia': 'Mismo Día',
    'moto': 'Moto',
    'email': 'Email',
    'correo': 'Correo',
    'sucursal_belgrano': 'Sucursal Belgrano',
    'dhl': 'DHL',
    'gratuito': 'Gratuito'
  };
  
  return channelMap[channel] || channel;
}

/**
 * Formats status display names for better readability
 * @param status - Raw status value from API
 * @returns Formatted display name
 */
export function formatStatusDisplayName(status: string): string {
  const statusMap: Record<string, string> = {
    'received': 'Received',
    'draft': 'Draft',
    'placed': 'Placed',
    'confirmed': 'Confirmed',
    'fulfilled': 'Fulfilled',
    'canceled': 'Canceled',
    'preparing': 'Preparing',
    'ready_for_delivery': 'Ready for Delivery',
    'pending_payment': 'Pending Payment',
    'payment_failed': 'Payment Failed',
    'in_transit': 'In Transit',
    'completed': 'Completed',
    'waiting': 'Waiting',
    'ready_for_pickup': 'Ready for Pickup',
    'payment_pending': 'Payment Pending'
  };
  
  return statusMap[status] || status;
}
