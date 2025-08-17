"use client";
import { useEffect, useMemo, useState } from "react";
import { listShipments } from "@/services/shipments/listShipments";
import type { ShipmentsFilter, Shipment } from "@/services/shipments/types";
import ShipmentFilters from "@/components/shipments/ShipmentFilters";
import ShipmentList from "@/components/shipments/ShipmentList";
import { PageHeader } from "@/components/ui/PageHeader";
import { ErrorAlert } from "@/components/ui/ErrorAlert";

function useShipmentFilters(): [ShipmentsFilter, (f: ShipmentsFilter)=>void] {
  const [filters, setFilters] = useState<ShipmentsFilter>({});
  return [filters, setFilters];
}

export default function ShipmentsPage() {
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
      <PageHeader 
        title="Shipments"
        subtitle="Track and manage all your deliveries"
      />

      {error && (
        <ErrorAlert 
          message={error}
          onRetry={() => void load()}
        />
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
