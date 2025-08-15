"use client";
import { useEffect, useMemo, useState } from "react";
import { listShipments } from "@/services/shipments/listShipments";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import type { ShipmentsFilter, Shipment } from "@/services/shipments/types";
import ShipmentFilters from "@/components/shipments/ShipmentFilters";
import ShipmentList from "@/components/shipments/ShipmentList";

function useShipmentFilters(): [ShipmentsFilter, (f: ShipmentsFilter)=>void] {
  const [filters, setFilters] = useState<ShipmentsFilter>({});
  return [filters, setFilters];
}

export default function ShipmentsPage() {
  useRequireAuth();
  const [filters, setFilters] = useShipmentFilters();
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<ReadonlyArray<Shipment>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useMemo(() => {
    return async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listShipments(filters);
        console.log('Fetched shipments data:', data);
        
        // Validate the data structure
        if (!Array.isArray(data)) {
          console.error('API returned non-array data:', data);
          setError('Invalid data format received from server');
          setRows([]);
          return;
        }
        
        // Validate each shipment has required fields
        const validData = data.filter((item, index) => {
          if (!item || typeof item !== 'object') {
            console.error(`Invalid shipment at index ${index}:`, item);
            return false;
          }
          
          if (!item.id || typeof item.id !== 'string') {
            console.error(`Shipment at index ${index} has invalid id:`, item);
            return false;
          }
          
          return true;
        });
        
        if (validData.length !== data.length) {
          console.warn(`Filtered out ${data.length - validData.length} invalid shipments`);
        }
        
        setRows(validData);
      } catch (error) {
        console.error('Error fetching shipments:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch shipments');
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
  }, [filters]);

  useEffect(() => { void load(); }, [load]);

  // Safe search handling
  const handleSearchChange = (value: string) => {
    const safeValue = value || "";
    setSearch(safeValue);
  };

  // Debug logging for current state
  console.log('ShipmentsPage current state:', { filters, search, rows, loading, error });

  return (
    <div className="p-6 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Shipments</h1>
        <p className="text-lg text-gray-600 mt-2">Track and manage all your deliveries</p>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">
            <strong>Error:</strong> {error}
            <button 
              onClick={() => void load()} 
              className="ml-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <ShipmentFilters 
        filters={filters} 
        onChange={setFilters} 
        onRefresh={load} 
        loading={loading} 
        search={search || ""} 
        onSearchChange={handleSearchChange} 
      />

      <ShipmentList items={rows} loading={loading} />
    </div>
  );
}
