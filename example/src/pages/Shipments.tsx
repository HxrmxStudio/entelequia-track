import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { ShipmentFilters } from '../components/shipments/ShipmentFilters';
import { ShipmentList } from '../components/shipments/ShipmentList';
export const Shipments = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    date: 'all',
    search: ''
  });
  const handleFilterChange = (filterUpdate: Partial<typeof filters>) => {
    setFilters(prev => ({
      ...prev,
      ...filterUpdate
    }));
  };
  return <Layout title="Shipments" subtitle="Track and manage all your deliveries">
      <div className="mb-6">
        <ShipmentFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>
      <ShipmentList filters={filters} />
    </Layout>;
};