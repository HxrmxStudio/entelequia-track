import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon, ClockIcon, CheckCircleIcon, TruckIcon, XCircleIcon, AlertTriangleIcon } from 'lucide-react';
interface Order {
  id: string;
  client: string;
  date: string;
  amount: string;
  status: 'pending' | 'out_for_delivery' | 'delivered' | 'failed' | 'delayed';
  window: string;
}
const getStatusConfig = (status: Order['status']) => {
  const configs = {
    pending: {
      label: 'Pending',
      variant: 'default' as const,
      icon: <ClockIcon size={14} />
    },
    out_for_delivery: {
      label: 'Out for Delivery',
      variant: 'default' as const,
      icon: <TruckIcon size={14} />
    },
    delivered: {
      label: 'Delivered',
      variant: 'success' as const,
      icon: <CheckCircleIcon size={14} />
    },
    failed: {
      label: 'Failed',
      variant: 'danger' as const,
      icon: <XCircleIcon size={14} />
    },
    delayed: {
      label: 'Delayed',
      variant: 'warning' as const,
      icon: <AlertTriangleIcon size={14} />
    }
  };
  return configs[status];
};
export const OrdersTable = () => {
  const orders: Order[] = [{
    id: 'ORD-7829',
    client: 'Acme Corp',
    date: '2023-07-15',
    amount: '$245.50',
    status: 'delayed',
    window: '14:00 - 16:00'
  }, {
    id: 'ORD-7845',
    client: 'Globex Industries',
    date: '2023-07-15',
    amount: '$1,120.00',
    status: 'out_for_delivery',
    window: '15:00 - 17:00'
  }, {
    id: 'ORD-7811',
    client: 'Stark Enterprises',
    date: '2023-07-15',
    amount: '$540.75',
    status: 'failed',
    window: '13:30 - 15:30'
  }, {
    id: 'ORD-7804',
    client: 'Wayne Industries',
    date: '2023-07-15',
    amount: '$89.99',
    status: 'out_for_delivery',
    window: '16:00 - 18:00'
  }, {
    id: 'ORD-7799',
    client: 'Oscorp',
    date: '2023-07-15',
    amount: '$320.25',
    status: 'delayed',
    window: '12:00 - 14:00'
  }, {
    id: 'ORD-7785',
    client: 'LexCorp',
    date: '2023-07-14',
    amount: '$750.00',
    status: 'delivered',
    window: '09:00 - 11:00'
  }, {
    id: 'ORD-7772',
    client: 'Umbrella Corporation',
    date: '2023-07-14',
    amount: '$435.60',
    status: 'delivered',
    window: '10:00 - 12:00'
  }, {
    id: 'ORD-7768',
    client: 'Cyberdyne Systems',
    date: '2023-07-14',
    amount: '$199.99',
    status: 'delivered',
    window: '14:00 - 16:00'
  }];
  return <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Delivery Window
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map(order => {
            const statusConfig = getStatusConfig(order.status);
            return <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.client}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={statusConfig.variant}>
                      <span className="flex items-center gap-1">
                        {statusConfig.icon}
                        <span>{statusConfig.label}</span>
                      </span>
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.window}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" leftIcon={<EyeIcon size={14} />}>
                      View
                    </Button>
                  </td>
                </tr>;
          })}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">1</span> to{' '}
          <span className="font-medium">8</span> of{' '}
          <span className="font-medium">42</span> results
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" leftIcon={<ChevronLeftIcon size={16} />}>
            Previous
          </Button>
          <Button variant="outline" size="sm" rightIcon={<ChevronRightIcon size={16} />}>
            Next
          </Button>
        </div>
      </div>
    </div>;
};