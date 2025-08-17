interface OrderDeliveryWindowProps {
  startDate?: string | null;
  endDate?: string | null;
  className?: string;
}

export default function OrderDeliveryWindow({ startDate, endDate, className = "" }: OrderDeliveryWindowProps) {
  if (!startDate || !endDate) {
    return (
      <span className={`text-gray-500 text-xs ${className}`}>
        Not set
      </span>
    );
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  return (
    <div className={`text-xs ${className}`}>
      <div className="font-medium">
        {start.toLocaleDateString()}
      </div>
      <div className="text-gray-500">
        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}
