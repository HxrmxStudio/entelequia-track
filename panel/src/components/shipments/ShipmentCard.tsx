"use client";

import Link from "next/link";
import type { Shipment } from "@/services/shipments/types";
import { Package, Clock, Navigation, CheckCircle, Truck, AlertCircle, XCircle, MapPin, Calendar, User } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function ShipmentCard({ s }: { s: Shipment }) {
  // Debug logging to see what data we're receiving
  console.log('ShipmentCard received data:', s);
  
  // Early return if no shipment data
  if (!s) {
    console.error('ShipmentCard: No shipment data provided');
    return (
      <Card className="p-4">
        <div className="text-red-500">Error: No shipment data</div>
      </Card>
    );
  }

  const statusConfig = {
    'queued': {
      icon: <Clock size={16} />,
      color: 'text-gray-600 bg-gray-100',
      label: 'Queued'
    },
    'out_for_delivery': {
      icon: <Truck size={16} />,
      color: 'text-primary-600 bg-primary-50',
      label: 'In Transit'
    },
    'delivered': {
      icon: <CheckCircle size={16} />,
      color: 'text-emerald-600 bg-emerald-50',
      label: 'Delivered'
    },
    'failed': {
      icon: <AlertCircle size={16} />,
      color: 'text-amber-600 bg-amber-50',
      label: 'Failed'
    },
    'canceled': {
      icon: <XCircle size={16} />,
      color: 'text-red-600 bg-red-50',
      label: 'Canceled'
    }
  };

  // Safe status handling with fallback
  const status = s.status && statusConfig[s.status] ? statusConfig[s.status] : {
    icon: <Clock size={16} />,
    color: 'text-gray-600 bg-gray-100',
    label: s.status || 'Unknown'
  };
  
  // Safe string slicing with comprehensive null checks
  const safeSlice = (str: any, start: number, end: number, fallback: string = 'N/A') => {
    if (!str || typeof str !== 'string') return fallback;
    try {
      return str.slice(start, end) + '…';
    } catch (error) {
      console.error('Error slicing string:', str, error);
      return fallback;
    }
  };

  const trackingId = safeSlice(s.id, 0, 8, 'N/A');
  const orderId = safeSlice(s.order_id, 0, 8, 'N/A');
  const qrToken = safeSlice(s.qr_token, 0, 6, 'N/A');

  // Safe date formatting
  const formatDate = (dateString: any) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  };

  return (
    <Card className="cursor-pointer hover:border-primary-300 transition-colors">
      <div className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            {/* Status and Date Row */}
            <div className="flex items-center gap-2 mb-2">
              <div className={`px-2 py-1 rounded-full flex items-center gap-1 ${status.color}`}>
                {status.icon}
                <span className="text-sm font-medium">{status.label}</span>
              </div>
              <div className="text-sm text-gray-500">
                {formatDate(s.eta)}
              </div>
            </div>

            {/* Tracking ID */}
            <h3 className="text-lg font-medium mb-1">
              Tracking ID: {trackingId}
            </h3>

            {/* Order ID and Method */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Package size={16} className="text-gray-400" />
                <span>Order: {orderId}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Navigation size={16} className="text-gray-400" />
                <span className="capitalize">{s.delivery_method || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Right Side Info */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            <div className="flex flex-col">
              <div className="text-xs text-gray-500">Estimated Delivery</div>
              <div className="flex items-center gap-1 mt-1">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-sm">
                  {formatDate(s.eta)}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col">
              <div className="text-xs text-gray-500">QR Token</div>
              <div className="flex items-center gap-1 mt-1">
                <Package size={14} className="text-gray-400" />
                <span className="text-sm font-mono text-xs">
                  {qrToken}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Link */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Link 
            href={`/shipments/${s.id || 'unknown'}`} 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
          >
            View Details →
          </Link>
        </div>
      </div>
    </Card>
  );
}


