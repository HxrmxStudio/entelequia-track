"use client";

import type { Shipment } from "@/services/shipments/types";
import ShipmentCard from "./ShipmentCard";
import { Package } from "lucide-react";
import { Card } from "@/components/ui/Card";

type Props = {
  items: ReadonlyArray<Shipment>;
  loading?: boolean;
};

export default function ShipmentList({ items, loading = false }: Props) {
  // Debug logging to see what items we're receiving
  console.log('ShipmentList received items:', items);
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Package size={24} className="text-gray-400" />
          </div>
          <div className="text-gray-500 mb-2">No shipments found</div>
          <p className="text-sm text-gray-400 max-w-md">
            Try adjusting your filters or search term. If you&rsquo;re expecting shipments, they may not have been created yet.
          </p>
        </div>
      </Card>
    );
  }

  // Filter out invalid shipments and log any issues
  const validShipments = items.filter((shipment, index) => {
    if (!shipment) {
      console.error(`Shipment at index ${index} is null or undefined`);
      return false;
    }
    
    if (!shipment.id) {
      console.error(`Shipment at index ${index} has no id:`, shipment);
      return false;
    }
    
    return true;
  });

  if (validShipments.length !== items.length) {
    console.warn(`Filtered out ${items.length - validShipments.length} invalid shipments`);
  }

  return (
    <div className="space-y-4">
      {validShipments.map((shipment, index) => (
        <ShipmentCard 
          key={shipment.id || `shipment-${index}`} 
          s={shipment} 
        />
      ))}
    </div>
  );
}


