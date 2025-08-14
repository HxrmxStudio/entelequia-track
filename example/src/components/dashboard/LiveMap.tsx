import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TruckIcon, PackageIcon, AlertCircleIcon } from 'lucide-react';
interface LiveMapProps {
  className?: string;
}
export const LiveMap = ({
  className = ''
}: LiveMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  useEffect(() => {
    if (!mapRef.current) return;
    // Initialize map if it doesn't exist
    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current).setView([40.7128, -74.006], 12);
      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap.current);
      // Create custom icons
      const courierIcon = L.divIcon({
        html: `<div class="bg-primary-600 p-1 rounded-full text-white flex items-center justify-center" style="width: 32px; height: 32px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
               </div>`,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      const deliveryIcon = L.divIcon({
        html: `<div class="bg-gray-900 p-1 rounded-full text-white flex items-center justify-center" style="width: 28px; height: 28px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path><path d="M16.5 9.4 7.55 4.24"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line><circle cx="18.5" cy="15.5" r="2.5"></circle><path d="M20.27 17.27 22 19"></path></svg>
               </div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      const alertIcon = L.divIcon({
        html: `<div class="bg-danger-500 p-1 rounded-full text-white flex items-center justify-center" style="width: 28px; height: 28px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
               </div>`,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      // Add couriers
      L.marker([40.7128, -74.006], {
        icon: courierIcon
      }).addTo(leafletMap.current).bindPopup('Courier: John Doe<br>14 deliveries complete<br>8 remaining');
      L.marker([40.7228, -73.9867], {
        icon: courierIcon
      }).addTo(leafletMap.current).bindPopup('Courier: Sarah Miller<br>11 deliveries complete<br>5 remaining');
      L.marker([40.7058, -74.0088], {
        icon: courierIcon
      }).addTo(leafletMap.current).bindPopup('Courier: Robert Smith<br>12 deliveries complete<br>10 remaining');
      // Add delivery points
      L.marker([40.7278, -73.9919], {
        icon: deliveryIcon
      }).addTo(leafletMap.current).bindPopup('Order #ORD-7829<br>ETA: 14:45');
      L.marker([40.7173, -74.0134], {
        icon: deliveryIcon
      }).addTo(leafletMap.current).bindPopup('Order #ORD-7845<br>ETA: 15:10');
      L.marker([40.7023, -73.9876], {
        icon: deliveryIcon
      }).addTo(leafletMap.current).bindPopup('Order #ORD-7811<br>ETA: 15:25');
      // Add alert points
      L.marker([40.7101, -74.0123], {
        icon: alertIcon
      }).addTo(leafletMap.current).bindPopup('ALERT: Delivery Window Breach<br>Order #ORD-7829<br>25 minutes behind schedule');
      L.marker([40.7198, -73.9912], {
        icon: alertIcon
      }).addTo(leafletMap.current).bindPopup('ALERT: GPS Signal Lost<br>Order #ORD-7845<br>Courier offline for 15+ minutes');
      // Add route polylines
      const route1 = [[40.7128, -74.006], [40.715, -73.995], [40.7173, -74.0134], [40.7278, -73.9919]];
      const route2 = [[40.7228, -73.9867], [40.7198, -73.9912], [40.7101, -74.0123]];
      const route3 = [[40.7058, -74.0088], [40.7023, -73.9876]];
      L.polyline(route1, {
        color: '#16a34a',
        weight: 3,
        opacity: 0.7
      }).addTo(leafletMap.current);
      L.polyline(route2, {
        color: '#16a34a',
        weight: 3,
        opacity: 0.7
      }).addTo(leafletMap.current);
      L.polyline(route3, {
        color: '#16a34a',
        weight: 3,
        opacity: 0.7
      }).addTo(leafletMap.current);
    }
    // Handle resize
    const handleResize = () => {
      if (leafletMap.current) {
        leafletMap.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return <div className={`relative rounded-lg overflow-hidden border border-gray-200 ${className}`}>
      <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded-md shadow-md">
        <div className="text-sm font-medium mb-2">Map Legend</div>
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
              <TruckIcon size={12} className="text-white" />
            </div>
            <span>Courier</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center">
              <PackageIcon size={12} className="text-white" />
            </div>
            <span>Delivery Point</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-danger-500 rounded-full flex items-center justify-center">
              <AlertCircleIcon size={12} className="text-white" />
            </div>
            <span>Alert</span>
          </div>
        </div>
      </div>
      <div ref={mapRef} style={{
      height: '100%',
      minHeight: '500px'
    }}></div>
    </div>;
};