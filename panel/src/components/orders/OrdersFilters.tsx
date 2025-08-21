import { useEffect, useState } from "react";
import type { OrdersFilter, FilterOptions } from "@/services/orders/types";
import { formatChannelDisplayName, formatStatusDisplayName } from "@/services/orders/utils";

interface OrdersFiltersProps {
  filters: OrdersFilter;
  onChange: (f: OrdersFilter) => void;
  onRefresh: () => void;
  loading: boolean;
  filterOptions: FilterOptions;
}

export default function OrdersFilters({ 
  filters, 
  onChange, 
  onRefresh, 
  loading, 
  filterOptions 
}: OrdersFiltersProps) {
  const [status, setStatus] = useState(String(filters.status ?? ""));
  const [channel, setChannel] = useState(String(filters.channel ?? ""));
  const [amountRange, setAmountRange] = useState(String(filters.amount_range ?? ""));
  
  // Sync local state with URL filters
  useEffect(() => { 
    setStatus(String(filters.status ?? "")); 
  }, [filters.status]);
  
  useEffect(() => { 
    setChannel(String(filters.channel ?? "")); 
  }, [filters.channel]);
  
  useEffect(() => { 
    setAmountRange(String(filters.amount_range ?? "")); 
  }, [filters.amount_range]);

  const handleApply = () => {
    onChange({
      status: status || undefined,
      channel: channel || undefined,
      amount_range: amountRange as 'low' | 'medium' | 'high' | undefined
    });
  };

  const handleClear = () => {
    setStatus("");
    setChannel("");
    setAmountRange("");
    onChange({});
  };

  // Check if any filters are active
  const hasActiveFilters = status || channel || amountRange;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Status</label>
          <select 
            className="border border-gray-300 bg-white rounded-md px-3 py-2 text-sm" 
            value={status} 
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {filterOptions.statuses.map(statusOption => (
              <option key={statusOption} value={statusOption}>
                {formatStatusDisplayName(statusOption)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Channel</label>
          <select 
            className="border border-gray-300 bg-white rounded-md px-3 py-2 text-sm" 
            value={channel} 
            onChange={e => setChannel(e.target.value)}
          >
            <option value="">All Channels</option>
            {filterOptions.channels.map(channelOption => (
              <option key={channelOption} value={channelOption}>
                {formatChannelDisplayName(channelOption)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex flex-col">
          <label className="text-xs text-gray-600 mb-1">Amount Range</label>
          <select 
            className="border border-gray-300 bg-white rounded-md px-3 py-2 text-sm" 
            value={amountRange} 
            onChange={e => setAmountRange(e.target.value)}
          >
            <option value="">All Amounts</option>
            <option value="low">Under $100</option>
            <option value="medium">$100 - $500</option>
            <option value="high">Over $500</option>
          </select>
        </div>
        
        <button 
          onClick={handleApply} 
          className="px-4 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700 font-medium"
        >
          Apply Filters
        </button>
        
        <button 
          onClick={handleClear} 
          className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700"
        >
          Clear All
        </button>
        
        <button 
          onClick={onRefresh} 
          className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-800">Active Filters:</span>
          {status && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Status: {formatStatusDisplayName(status)}
            </span>
          )}
          {channel && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Channel: {formatChannelDisplayName(channel)}
            </span>
          )}
          {amountRange && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Amount: {amountRange === 'low' ? 'Under $100' : amountRange === 'medium' ? '$100 - $500' : 'Over $500'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
