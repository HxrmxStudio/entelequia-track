import React from 'react';
import { Layout } from '../components/layout/Layout';
import { OrderFilters } from '../components/orders/OrderFilters';
import { OrdersTable } from '../components/orders/OrdersTable';
export const Orders = () => {
  return <Layout title="Orders" subtitle="Manage and track all delivery orders">
      <OrderFilters />
      <OrdersTable />
    </Layout>;
};