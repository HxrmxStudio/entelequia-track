import React from 'react';
import { Button } from '../ui/Button';
import { FilterIcon, CalendarIcon, UserIcon, TruckIcon, CheckCircleIcon, XCircleIcon, ClockIcon, RefreshCwIcon } from 'lucide-react';
export const OrderFilters = () => {
  return <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <h3 className="text-lg font-medium">Filters</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<RefreshCwIcon size={14} />}>
            Reset
          </Button>
          <Button size="sm" leftIcon={<FilterIcon size={14} />}>
            Apply Filters
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <div className="relative">
            <input type="text" placeholder="Select dates" className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full" />
            <CalendarIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer
          </label>
          <div className="relative">
            <input type="text" placeholder="Search customer" className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full" />
            <UserIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Courier
          </label>
          <div className="relative">
            <select className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full appearance-none">
              <option value="">All Couriers</option>
              <option value="john">John Doe</option>
              <option value="sarah">Sarah Miller</option>
              <option value="mike">Mike Johnson</option>
              <option value="lisa">Lisa Wong</option>
              <option value="robert">Robert Smith</option>
            </select>
            <TruckIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <div className="relative">
            <select className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full appearance-none">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="delayed">Delayed</option>
            </select>
            <CheckCircleIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <div className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
          <ClockIcon size={14} />
          <span>Last 7 days</span>
          <button className="ml-1 text-primary-500 hover:text-primary-700">
            <XCircleIcon size={14} />
          </button>
        </div>
        <div className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
          <CheckCircleIcon size={14} />
          <span>Delivered</span>
          <button className="ml-1 text-primary-500 hover:text-primary-700">
            <XCircleIcon size={14} />
          </button>
        </div>
        <div className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
          <TruckIcon size={14} />
          <span>John Doe</span>
          <button className="ml-1 text-primary-500 hover:text-primary-700">
            <XCircleIcon size={14} />
          </button>
        </div>
      </div>
    </div>;
};