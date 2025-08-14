import React from 'react';
import { Badge } from '../ui/Badge';
import { TruckIcon, AlertCircleIcon, CheckCircleIcon, WifiOffIcon } from 'lucide-react';
interface DeliveryStatusProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  variant: 'default' | 'success' | 'warning' | 'danger';
}
const DeliveryStatus = ({
  title,
  count,
  icon,
  variant
}: DeliveryStatusProps) => {
  const variantClasses = {
    default: 'bg-gray-50 border-gray-200',
    success: 'bg-success-50 border-success-200',
    warning: 'bg-warning-50 border-warning-200',
    danger: 'bg-danger-50 border-danger-200'
  };
  return <div className={`flex items-center gap-3 p-3 border rounded-lg ${variantClasses[variant]}`}>
      <div className={`text-${variant === 'default' ? 'primary' : variant}-500`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-700">{title}</div>
        <div className="text-2xl font-semibold">{count}</div>
      </div>
    </div>;
};
interface CourierItemProps {
  name: string;
  status: 'active' | 'offline' | 'break';
  deliveries: number;
  remaining: number;
}
const CourierItem = ({
  name,
  status,
  deliveries,
  remaining
}: CourierItemProps) => {
  const statusConfig = {
    active: {
      label: 'Active',
      variant: 'success' as const
    },
    offline: {
      label: 'Offline',
      variant: 'danger' as const
    },
    break: {
      label: 'On break',
      variant: 'warning' as const
    }
  };
  return <div className="flex items-center gap-3 p-3 border-b border-gray-200 last:border-b-0">
      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
        {name.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="font-medium">{name}</div>
          <Badge variant={statusConfig[status].variant} size="sm">
            {statusConfig[status].label}
          </Badge>
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {deliveries} delivered, {remaining} remaining
        </div>
      </div>
    </div>;
};
export const StatusSidebar = () => {
  return <div className="h-full flex flex-col bg-white border-l border-gray-200 w-80">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium">Delivery Status</h2>
        <p className="text-sm text-gray-500">Live tracking overview</p>
      </div>
      <div className="p-4 space-y-3">
        <DeliveryStatus title="Out for Delivery" count={42} icon={<TruckIcon size={20} className="text-primary-600" />} variant="default" />
        <DeliveryStatus title="GPS Offline" count={3} icon={<WifiOffIcon size={20} />} variant="danger" />
        <DeliveryStatus title="Delivered Today" count={128} icon={<CheckCircleIcon size={20} />} variant="success" />
        <DeliveryStatus title="SLA Alerts" count={7} icon={<AlertCircleIcon size={20} />} variant="warning" />
      </div>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Active Couriers</h3>
          <span className="text-sm text-gray-500">12 online</span>
        </div>
        <div className="overflow-y-auto" style={{
        maxHeight: 'calc(100vh - 350px)'
      }}>
          <CourierItem name="John Doe" status="active" deliveries={14} remaining={8} />
          <CourierItem name="Sarah Miller" status="active" deliveries={11} remaining={5} />
          <CourierItem name="Mike Johnson" status="offline" deliveries={9} remaining={0} />
          <CourierItem name="Lisa Wong" status="break" deliveries={16} remaining={7} />
          <CourierItem name="Robert Smith" status="active" deliveries={12} remaining={10} />
        </div>
      </div>
    </div>;
};