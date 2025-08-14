import React from 'react';
import { Layout } from '../components/layout/Layout';
import { LiveMap } from '../components/dashboard/LiveMap';
import { StatusSidebar } from '../components/dashboard/StatusSidebar';
import { AlertsPanel } from '../components/dashboard/AlertsPanel';
export const Dashboard = () => {
  return <Layout title="Dashboard" subtitle="Live delivery tracking overview">
      <div className="flex flex-col lg:flex-row h-full">
        <div className="flex-1 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Live Map</h2>
            <p className="text-sm text-gray-500">
              Real-time courier locations and delivery routes
            </p>
          </div>
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <LiveMap className="h-[calc(100vh-250px)]" />
            </div>
            <div className="space-y-6">
              <AlertsPanel />
            </div>
          </div>
        </div>
        <div className="mt-6 lg:mt-0">
          <StatusSidebar />
        </div>
      </div>
    </Layout>;
};