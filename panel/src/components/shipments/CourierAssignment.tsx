"use client";

import { useState, useEffect, useMemo } from "react";
import { listCouriers } from "@/services/couriers/listCouriers";
import type { Courier } from "@/services/couriers/types";
import { Search, User, Mail, Phone } from "lucide-react";

type Props = {
  currentCourierId?: string;
  onAssign: (courierId: string) => Promise<void>;
  disabled?: boolean;
};

export default function CourierAssignment({ currentCourierId, onAssign, disabled = false }: Props) {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourierId, setSelectedCourierId] = useState(currentCourierId || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load couriers on mount
  useEffect(() => {
    const loadCouriers = async () => {
      try {
        const data = await listCouriers({ active: true });
        setCouriers(data);
      } catch (err) {
        setError("Error loading couriers");
        console.error("Failed to load couriers:", err);
      }
    };
    loadCouriers();
  }, []);

  // Filter couriers based on search term
  const filteredCouriers = useMemo(() => {
    if (!searchTerm.trim()) return couriers;
    
    const term = searchTerm.toLowerCase();
    return couriers.filter(courier => 
      courier.name.toLowerCase().includes(term) ||
      courier.email?.toLowerCase().includes(term) ||
      courier.phone?.includes(term)
    );
  }, [couriers, searchTerm]);

  // Handle courier assignment
  const handleAssign = async () => {
    if (!selectedCourierId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onAssign(selectedCourierId);
      setSearchTerm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assignment failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Get current courier info for display
  const currentCourier = useMemo(() => 
    couriers.find(c => c.id === currentCourierId),
    [couriers, currentCourierId]
  );

  return (
    <div className="space-y-4">
      {/* Current Assignment Display */}
      {currentCourier && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <User size={16} />
            <span className="font-medium">Currently assigned to:</span>
            <span className="font-semibold">{currentCourier.name}</span>
            {currentCourier.email && (
              <span className="text-green-600">({currentCourier.email})</span>
            )}
          </div>
        </div>
      )}

      {/* Assignment Form */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search couriers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            disabled={disabled}
          />
        </div>

        {/* Courier List */}
        {searchTerm && filteredCouriers.length > 0 && (
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
            {filteredCouriers.map((courier) => (
              <button
                key={courier.id}
                onClick={() => setSelectedCourierId(courier.id)}
                className={`w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                  selectedCourierId === courier.id ? "bg-primary-50 border-primary-200" : ""
                }`}
                disabled={disabled}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{courier.name}</div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {courier.email && (
                        <div className="flex items-center gap-1">
                          <Mail size={14} />
                          <span>{courier.email}</span>
                        </div>
                      )}
                      {courier.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          <span>{courier.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {courier.vehicle && `🚗 ${courier.vehicle}`}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {searchTerm && filteredCouriers.length === 0 && (
          <div className="text-center py-4 text-sm text-gray-500">
            No couriers found matching &quot;{searchTerm}&quot;
          </div>
        )}

        {/* Assignment Button */}
        <button
          onClick={handleAssign}
          disabled={disabled || isLoading || !selectedCourierId || selectedCourierId === currentCourierId}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Assigning..." : "Assign Selected Courier"}
        </button>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
