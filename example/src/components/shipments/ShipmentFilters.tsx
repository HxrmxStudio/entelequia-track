import React from 'react';
import { SearchIcon, FilterIcon } from 'lucide-react';
interface FiltersProps {
  filters: {
    status: string;
    date: string;
    search: string;
  };
  onFilterChange: (filters: Partial<{
    status: string;
    date: string;
    search: string;
  }>) => void;
}
export const ShipmentFilters = ({
  filters,
  onFilterChange
}: FiltersProps) => {
  return <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon size={18} className="text-gray-400" />
          </div>
          <input type="text" placeholder="Search by tracking ID, customer name or address..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" value={filters.search} onChange={e => onFilterChange({
          search: e.target.value
        })} />
        </div>
        <div className="flex gap-4">
          <div className="w-full md:w-48">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select id="status-filter" className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" value={filters.status} onChange={e => onFilterChange({
            status: e.target.value
          })}>
              <option value="all">All Statuses</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="pending">Pending</option>
              <option value="delayed">Delayed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="w-full md:w-48">
            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select id="date-filter" className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500" value={filters.date} onChange={e => onFilterChange({
            date: e.target.value
          })}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            <FilterIcon size={18} />
            <span>More Filters</span>
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {filters.status !== 'all' && <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center">
            Status: {filters.status}
            <button className="ml-2 text-primary-500 hover:text-primary-700" onClick={() => onFilterChange({
          status: 'all'
        })}>
              &times;
            </button>
          </div>}
        {filters.date !== 'all' && <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center">
            Date: {filters.date}
            <button className="ml-2 text-primary-500 hover:text-primary-700" onClick={() => onFilterChange({
          date: 'all'
        })}>
              &times;
            </button>
          </div>}
        {(filters.status !== 'all' || filters.date !== 'all' || filters.search) && <button className="text-gray-500 text-sm hover:text-gray-700" onClick={() => onFilterChange({
        status: 'all',
        date: 'all',
        search: ''
      })}>
            Clear all filters
          </button>}
      </div>
    </div>;
};