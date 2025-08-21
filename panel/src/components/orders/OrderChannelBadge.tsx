import { formatChannelDisplayName } from "@/services/orders/utils";

interface OrderChannelBadgeProps {
  channel?: string | null;
  className?: string;
}

export default function OrderChannelBadge({ channel, className = "" }: OrderChannelBadgeProps) {
  const getChannelStyles = (channel?: string | null) => {
    switch (channel) {
      case 'web':
        return 'bg-blue-100 text-blue-800';
      case 'moto':
        return 'bg-green-100 text-green-800';
      case 'correo':
      case 'correo_sucursal':
        return 'bg-yellow-100 text-yellow-800';
      case 'dhl':
      case 'andreani':
      case 'urbano':
      case 'fast_mail':
        return 'bg-purple-100 text-purple-800';
      case 'mercado_envios':
        return 'bg-orange-100 text-orange-800';
      case 'email':
        return 'bg-indigo-100 text-indigo-800';
      case 'mismo_dia':
        return 'bg-red-100 text-red-800';
      case 'gratuito':
        return 'bg-emerald-100 text-emerald-800';
      case 'sucursal':
      case 'sucursal_belgrano':
      case 'sucursal_centro':
        return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChannelStyles(channel)} ${className}`}>
      {channel ? formatChannelDisplayName(channel) : 'Unknown'}
    </span>
  );
}
