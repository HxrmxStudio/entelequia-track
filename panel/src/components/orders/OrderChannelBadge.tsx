interface OrderChannelBadgeProps {
  channel?: string | null;
  className?: string;
}

export default function OrderChannelBadge({ channel, className = "" }: OrderChannelBadgeProps) {
  const getChannelStyles = (channel?: string | null) => {
    switch (channel) {
      case 'web':
        return 'bg-blue-100 text-blue-800';
      case 'mercado_libre':
        return 'bg-orange-100 text-orange-800';
      case 'tienda':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChannelLabel = (channel?: string | null) => {
    switch (channel) {
      case 'web':
        return 'Web';
      case 'mercado_libre':
        return 'Mercado Libre';
      case 'tienda':
        return 'Tienda';
      default:
        return 'Web';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getChannelStyles(channel)} ${className}`}>
      {getChannelLabel(channel)}
    </span>
  );
}
