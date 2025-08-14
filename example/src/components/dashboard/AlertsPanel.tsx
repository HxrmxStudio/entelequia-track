import React from 'react';
import { Badge } from '../ui/Badge';
import { AlertTriangleIcon, ClockIcon, PackageIcon, MapPinIcon } from 'lucide-react';
interface AlertItemProps {
  title: string;
  description: string;
  time: string;
  type: 'delay' | 'offline' | 'otp' | 'geofence';
  orderId: string;
}
const AlertItem = ({
  title,
  description,
  time,
  type,
  orderId
}: AlertItemProps) => {
  const typeConfig = {
    delay: {
      icon: <ClockIcon size={16} />,
      variant: 'warning' as const,
      label: 'Delay'
    },
    offline: {
      icon: <AlertTriangleIcon size={16} />,
      variant: 'danger' as const,
      label: 'Offline'
    },
    otp: {
      icon: <PackageIcon size={16} />,
      variant: 'danger' as const,
      label: 'OTP Failed'
    },
    geofence: {
      icon: <MapPinIcon size={16} />,
      variant: 'warning' as const,
      label: 'Geofence'
    }
  };
  return <div className="p-3 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="flex items-center justify-between mb-1">
        <div className="font-medium text-gray-900">{title}</div>
        <Badge variant={typeConfig[type].variant} size="sm">
          <span className="flex items-center gap-1">
            {typeConfig[type].icon}
            <span>{typeConfig[type].label}</span>
          </span>
        </Badge>
      </div>
      <div className="text-sm text-gray-600 mb-1">{description}</div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{time}</span>
        <span className="text-primary-600 font-medium">Order #{orderId}</span>
      </div>
    </div>;
};
export const AlertsPanel = () => {
  return <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">SLA Alerts</h3>
          <p className="text-sm text-gray-500">Potential delivery issues</p>
        </div>
        <Badge variant="danger">7 Active</Badge>
      </div>
      <div className="max-h-96 overflow-y-auto">
        <AlertItem title="Delivery Window Breach" description="Courier is running 25 minutes behind schedule" time="10 mins ago" type="delay" orderId="ORD-7829" />
        <AlertItem title="GPS Signal Lost" description="Courier offline for more than 15 minutes" time="32 mins ago" type="offline" orderId="ORD-7845" />
        <AlertItem title="OTP Verification Failed" description="3 failed attempts, customer unreachable" time="45 mins ago" type="otp" orderId="ORD-7811" />
        <AlertItem title="Outside Delivery Zone" description="Courier 2.5km away from delivery point" time="1 hour ago" type="geofence" orderId="ORD-7804" />
        <AlertItem title="Delivery Window Breach" description="Order will miss promised delivery window" time="1 hour ago" type="delay" orderId="ORD-7799" />
      </div>
      <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
        <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
          View All Alerts
        </button>
      </div>
    </div>;
};