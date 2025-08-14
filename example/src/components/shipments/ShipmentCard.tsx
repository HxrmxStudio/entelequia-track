import React from 'react';
import { TruckIcon, ClockIcon, CheckCircleIcon, AlertTriangleIcon, XCircleIcon, PackageIcon, MapPinIcon, CalendarIcon, UserIcon } from 'lucide-react';
import { Card } from '../ui/Card';
export interface Shipment {
  id: string;
  trackingId: string;
  customer: {
    name: string;
    address: string;
    phone: string;
  };
  status: 'in-transit' | 'delivered' | 'pending' | 'delayed' | 'cancelled';
  createdAt: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  courier?: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  notes?: string;
}
interface ShipmentCardProps {
  shipment: Shipment;
  onClick?: (id: string) => void;
}
export const ShipmentCard = ({
  shipment,
  onClick
}: ShipmentCardProps) => {
  const statusConfig = {
    'in-transit': {
      icon: <TruckIcon size={16} />,
      color: 'text-primary-600 bg-primary-50',
      label: 'In Transit'
    },
    delivered: {
      icon: <CheckCircleIcon size={16} />,
      color: 'text-success-600 bg-success-50',
      label: 'Delivered'
    },
    pending: {
      icon: <ClockIcon size={16} />,
      color: 'text-gray-600 bg-gray-100',
      label: 'Pending'
    },
    delayed: {
      icon: <AlertTriangleIcon size={16} />,
      color: 'text-warning-600 bg-warning-50',
      label: 'Delayed'
    },
    cancelled: {
      icon: <XCircleIcon size={16} />,
      color: 'text-danger-600 bg-danger-50',
      label: 'Cancelled'
    }
  };
  const status = statusConfig[shipment.status];
  const handleClick = () => {
    if (onClick) {
      onClick(shipment.id);
    }
  };
  return <Card className="cursor-pointer hover:border-primary-300 transition-colors" onClick={handleClick}>
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`px-2 py-1 rounded-full flex items-center gap-1 ${status.color}`}>
              {status.icon}
              <span className="text-sm font-medium">{status.label}</span>
            </div>
            <div className="text-sm text-gray-500">
              {new Date(shipment.createdAt).toLocaleDateString()}
            </div>
          </div>
          <h3 className="text-lg font-medium mb-1">
            Tracking ID: {shipment.trackingId}
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <UserIcon size={16} className="text-gray-400" />
              <span>{shipment.customer.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPinIcon size={16} className="text-gray-400" />
              <span className="truncate max-w-[250px]">
                {shipment.customer.address}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
          <div className="flex flex-col">
            <div className="text-xs text-gray-500">Estimated Delivery</div>
            <div className="flex items-center gap-1 mt-1">
              <CalendarIcon size={14} className="text-gray-400" />
              <span className="text-sm">
                {new Date(shipment.estimatedDelivery).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-xs text-gray-500">Items</div>
            <div className="flex items-center gap-1 mt-1">
              <PackageIcon size={14} className="text-gray-400" />
              <span className="text-sm">
                {shipment.items.reduce((sum, item) => sum + item.quantity, 0)}{' '}
                items
              </span>
            </div>
          </div>
        </div>
      </div>
      {shipment.notes && <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-sm text-gray-500">{shipment.notes}</div>
        </div>}
    </Card>;
};