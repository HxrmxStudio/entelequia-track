"use client";

import { useEffect, useState } from "react";
import type { ShipmentsFilter, ShipmentStatus, DeliveryMethod } from "@/services/shipments/types";
import type { Courier } from "@/services/couriers/types";
import { isShipmentStatus, isDeliveryMethod } from "@/lib/typeGuards";
import { Filter, Search, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { listCouriers } from "@/services/couriers/listCouriers";

type Props = {
  filters: ShipmentsFilter;
  onChange: (next: ShipmentsFilter) => void;
  onRefresh: () => void;
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
};

export default function ShipmentFilters({ filters, onChange, onRefresh, loading, search, onSearchChange }: Props) {
  const [status, setStatus] = useState(filters.status ?? "");
  const [courierId, setCourierId] = useState(filters.courier_id ?? "");
  const [date, setDate] = useState<string>(filters.date ?? "");
  const [method, setMethod] = useState<DeliveryMethod | "">((filters as { delivery_method?: DeliveryMethod }).delivery_method ?? "");
  const [couriers, setCouriers] = useState<Courier[]>([]);

  useEffect(() => { setStatus(filters.status ?? ""); }, [filters.status]);
  useEffect(() => { setCourierId(filters.courier_id ?? ""); }, [filters.courier_id]);
  useEffect(() => { setDate(filters.date ?? ""); }, [filters.date]);

  // Load couriers for filter dropdown
  useEffect(() => {
    const loadCouriers = async () => {
      try {
        const data = await listCouriers({ active: true });
        setCouriers(data);
      } catch (err) {
        console.error("Failed to load couriers:", err);
      }
    };
    loadCouriers();
  }, []);

  const handleApplyFilters = () => {
    onChange({ 
      status: status && isShipmentStatus(status) ? status : undefined, 
      courier_id: courierId || undefined, 
      date: date === "today" ? "today" : undefined, 
      ...(method && isDeliveryMethod(method) ? { delivery_method: method } : {}) 
    });
  };

  const handleClearFilters = () => {
    setStatus("");
    setCourierId("");
    setDate("");
    setMethod("");
    onSearchChange("");
    onChange({});
  };

  const handleSearchChange = (value: string) => {
    // Ensure we're always passing a string
    const safeValue = value || "";
    onSearchChange(safeValue);
  };

  const hasActiveFilters = status || courierId || date || method || search;

  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search by tracking ID, customer name or address..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm" 
            value={search || ""} 
            onChange={e => handleSearchChange(e.target.value)} 
          />
        </div>

        {/* Filter Controls */}
        <div className="flex gap-4">
          <div className="w-full md:w-48">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select 
              id="status-filter" 
              className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm" 
              value={status || ""} 
              onChange={e => setStatus(e.target.value as ShipmentStatus | "")}
            >
              <option value="">All Statuses</option>
              <option value="queued">Queued</option>
              <option value="out_for_delivery">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          <div className="w-full md:w-48">
            <label htmlFor="method-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Method
            </label>
            <select 
              id="method-filter" 
              className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm" 
              value={method || ""} 
              onChange={e => setMethod(e.target.value as DeliveryMethod | "")}
            >
              <option value="">All Methods</option>
              <option value="courier">Courier</option>
              <option value="pickup">Pickup</option>
              <option value="carrier">Carrier</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="w-full md:w-48">
            <label htmlFor="courier-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Courier
            </label>
            <select 
              id="courier-filter" 
              className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm" 
              value={courierId || ""} 
              onChange={e => setCourierId(e.target.value)}
            >
              <option value="">All Couriers</option>
              {couriers.map(courier => (
                <option key={courier.id} value={courier.id}>
                  {courier.name} {courier.email ? `(${courier.email})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-48">
            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select 
              id="date-filter" 
              className="w-full border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm" 
              value={date || ""} 
              onChange={e => setDate(e.target.value)}
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
            </select>
          </div>

          <button 
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            onClick={() => {}} // TODO: Implement more filters
          >
            <Filter size={18} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          onClick={handleApplyFilters}
          variant="primary"
        >
          Apply Filters
        </Button>
        
        <Button 
          onClick={onRefresh} 
          variant="outline"
          loading={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </Button>

        {hasActiveFilters && (
          <Button 
            onClick={handleClearFilters}
            variant="ghost"
            size="sm"
          >
            Clear all filters
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {status && (
            <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Status: {status}
              <button 
                className="text-primary-500 hover:text-primary-700" 
                onClick={() => setStatus("")}
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          {method && (
            <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Method: {method}
              <button 
                className="text-primary-500 hover:text-primary-700" 
                onClick={() => setMethod("")}
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          {date && (
            <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Date: {date}
              <button 
                className="text-primary-500 hover:text-primary-700" 
                onClick={() => setDate("")}
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          {courierId && (
            <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Courier: {couriers.find(c => c.id === courierId)?.name || courierId}
              <button 
                className="text-primary-500 hover:text-primary-700" 
                onClick={() => setCourierId("")}
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          {search && (
            <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm flex items-center gap-2">
              Search: &ldquo;{search}&rdquo;
              <button 
                className="text-primary-500 hover:text-primary-700" 
                onClick={() => handleSearchChange("")}
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}


