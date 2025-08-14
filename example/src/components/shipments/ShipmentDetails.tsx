import React from 'react';
import { XIcon, TruckIcon, ClockIcon, CheckCircleIcon, AlertTriangleIcon, XCircleIcon, PhoneIcon, MapPinIcon, PackageIcon, CalendarIcon, UserIcon } from 'lucide-react';
import { Shipment } from './ShipmentCard';
interface ShipmentDetailsProps {
  shipment: Shipment;
  onClose: () => void;
}
export const ShipmentDetails = ({
  shipment,
  onClose
}: ShipmentDetailsProps) => {
  const statusConfig = {
    'in-transit': {
      icon: <TruckIcon size={20} />,
      color: 'text-primary-600 bg-primary-50',
      label: 'In Transit'
    },
    delivered: {
      icon: <CheckCircleIcon size={20} />,
      color: 'text-success-600 bg-success-50',
      label: 'Delivered'
    },
    pending: {
      icon: <ClockIcon size={20} />,
      color: 'text-gray-600 bg-gray-100',
      label: 'Pending'
    },
    delayed: {
      icon: <AlertTriangleIcon size={20} />,
      color: 'text-warning-600 bg-warning-50',
      label: 'Delayed'
    },
    cancelled: {
      icon: <XCircleIcon size={20} />,
      color: 'text-danger-600 bg-danger-50',
      label: 'Cancelled'
    }
  };
  const status = statusConfig[shipment.status];
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Shipment Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XIcon size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="flex-1">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${status.color} mb-3`}>
                {status.icon}
                <span className="font-medium">{status.label}</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">{shipment.trackingId}</h3>
              <div className="text-sm text-gray-500">
                Created on {new Date(shipment.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Customer Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserIcon size={16} className="text-gray-400" />
                  <span>{shipment.customer.name}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPinIcon size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                  <span>{shipment.customer.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon size={16} className="text-gray-400" />
                  <span>{shipment.customer.phone}</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Delivery Information</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={16} className="text-gray-400" />
                  <span>
                    Estimated:{' '}
                    {new Date(shipment.estimatedDelivery).toLocaleString()}
                  </span>
                </div>
                {shipment.actualDelivery && <div className="flex items-center gap-2">
                    <CheckCircleIcon size={16} className="text-success-500" />
                    <span>
                      Delivered:{' '}
                      {new Date(shipment.actualDelivery).toLocaleString()}
                    </span>
                  </div>}
                {shipment.courier && <div className="flex items-center gap-2">
                    <TruckIcon size={16} className="text-gray-400" />
                    <span>Courier: {shipment.courier}</span>
                  </div>}
              </div>
            </div>
          </div>
          <div className="mb-6">
            <h4 className="font-medium mb-3">Items</h4>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 text-left text-sm font-medium text-gray-600">
                      Item
                    </th>
                    <th className="py-2 px-4 text-right text-sm font-medium text-gray-600">
                      Quantity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shipment.items.map((item, index) => <tr key={index} className="border-t border-gray-200">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <PackageIcon size={16} className="text-gray-400" />
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">{item.quantity}</td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>
          {shipment.notes && <div className="mb-6">
              <h4 className="font-medium mb-2">Notes</h4>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                {shipment.notes}
              </div>
            </div>}
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Close
            </button>
            <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
              Print Details
            </button>
          </div>
        </div>
      </div>
    </div>;
};