import React, { useState } from 'react';
import { ShipmentCard, Shipment } from './ShipmentCard';
import { ShipmentDetails } from './ShipmentDetails';
// Mock data
const MOCK_SHIPMENTS: Shipment[] = [{
  id: 'shp-001',
  trackingId: 'ETQ-12345678',
  customer: {
    name: 'John Smith',
    address: '123 Main St, New York, NY 10001',
    phone: '+1 (555) 123-4567'
  },
  status: 'in-transit',
  createdAt: '2023-06-15T08:30:00Z',
  estimatedDelivery: '2023-06-16T17:00:00Z',
  courier: 'Michael Rodriguez',
  items: [{
    name: 'Laptop',
    quantity: 1
  }, {
    name: 'Wireless Mouse',
    quantity: 1
  }]
}, {
  id: 'shp-002',
  trackingId: 'ETQ-87654321',
  customer: {
    name: 'Sarah Johnson',
    address: '456 Park Ave, Boston, MA 02108',
    phone: '+1 (555) 987-6543'
  },
  status: 'delivered',
  createdAt: '2023-06-14T10:15:00Z',
  estimatedDelivery: '2023-06-15T14:00:00Z',
  actualDelivery: '2023-06-15T13:45:00Z',
  courier: 'David Wilson',
  items: [{
    name: 'Office Chair',
    quantity: 1
  }]
}, {
  id: 'shp-003',
  trackingId: 'ETQ-23456789',
  customer: {
    name: 'Emily Davis',
    address: '789 Oak St, Chicago, IL 60601',
    phone: '+1 (555) 234-5678'
  },
  status: 'delayed',
  createdAt: '2023-06-13T09:45:00Z',
  estimatedDelivery: '2023-06-14T15:30:00Z',
  courier: 'Jessica Brown',
  items: [{
    name: 'Desk Lamp',
    quantity: 2
  }, {
    name: 'Notebook Set',
    quantity: 1
  }, {
    name: 'Pen Holder',
    quantity: 1
  }],
  notes: 'Delivery delayed due to weather conditions'
}, {
  id: 'shp-004',
  trackingId: 'ETQ-34567890',
  customer: {
    name: 'Robert Wilson',
    address: '101 Pine St, Seattle, WA 98101',
    phone: '+1 (555) 345-6789'
  },
  status: 'pending',
  createdAt: '2023-06-15T11:20:00Z',
  estimatedDelivery: '2023-06-17T16:00:00Z',
  items: [{
    name: 'Wireless Headphones',
    quantity: 1
  }, {
    name: 'Phone Case',
    quantity: 1
  }]
}, {
  id: 'shp-005',
  trackingId: 'ETQ-45678901',
  customer: {
    name: 'Jennifer Martinez',
    address: '202 Cedar St, San Francisco, CA 94105',
    phone: '+1 (555) 456-7890'
  },
  status: 'cancelled',
  createdAt: '2023-06-12T14:10:00Z',
  estimatedDelivery: '2023-06-14T12:00:00Z',
  items: [{
    name: 'Bluetooth Speaker',
    quantity: 1
  }],
  notes: 'Cancelled by customer'
}];
interface ShipmentListProps {
  filters: {
    status: string;
    date: string;
    search: string;
  };
}
export const ShipmentList = ({
  filters
}: ShipmentListProps) => {
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const filteredShipments = MOCK_SHIPMENTS.filter(shipment => {
    // Filter by status
    if (filters.status !== 'all' && shipment.status !== filters.status) {
      return false;
    }
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesTracking = shipment.trackingId.toLowerCase().includes(searchTerm);
      const matchesCustomer = shipment.customer.name.toLowerCase().includes(searchTerm);
      const matchesAddress = shipment.customer.address.toLowerCase().includes(searchTerm);
      if (!matchesTracking && !matchesCustomer && !matchesAddress) {
        return false;
      }
    }
    // Filter by date (simplified implementation)
    if (filters.date !== 'all') {
      const shipmentDate = new Date(shipment.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - today.getDay());
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      if (filters.date === 'today' && shipmentDate < today || filters.date === 'yesterday' && (shipmentDate < yesterday || shipmentDate >= today) || filters.date === 'week' && shipmentDate < weekStart || filters.date === 'month' && shipmentDate < monthStart) {
        return false;
      }
    }
    return true;
  });
  const handleShipmentClick = (id: string) => {
    const shipment = MOCK_SHIPMENTS.find(s => s.id === id);
    if (shipment) {
      setSelectedShipment(shipment);
    }
  };
  const handleCloseDetails = () => {
    setSelectedShipment(null);
  };
  return <div>
      {filteredShipments.length === 0 ? <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <div className="text-gray-500 mb-2">No shipments found</div>
          <p className="text-sm text-gray-400">
            Try adjusting your filters or search term
          </p>
        </div> : <div className="space-y-4">
          {filteredShipments.map(shipment => <ShipmentCard key={shipment.id} shipment={shipment} onClick={handleShipmentClick} />)}
        </div>}
      {selectedShipment && <ShipmentDetails shipment={selectedShipment} onClose={handleCloseDetails} />}
    </div>;
};