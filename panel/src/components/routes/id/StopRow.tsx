"use client";

import type { StopItem } from "@/services/stops/types";

interface StopRowProps {
  stop: StopItem;
  onDragStart: (e: React.DragEvent<HTMLTableRowElement>, stopId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLTableRowElement>) => void;
  onDrop: (e: React.DragEvent<HTMLTableRowElement>, stopId: string) => void;
  onComplete: (stopId: string) => void;
  onFail: (stopId: string) => void;
  busy: boolean;
}

export function StopRow({ 
  stop, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  onComplete, 
  onFail, 
  busy 
}: StopRowProps) {
  return (
    <tr
      key={stop.id}
      draggable
      onDragStart={(e) => onDragStart(e, stop.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, stop.id)}
      className="border-t border-gray-100 hover:bg-gray-50"
    >
      <td className="p-2">{stop.sequence}</td>
      <td className="p-2 capitalize">{stop.status}</td>
      <td className="p-2">{stop.eta ? new Date(stop.eta).toLocaleString() : "-"}</td>
      <td className="p-2">{stop.address ?? "-"}</td>
      <td className="p-2">{stop.lat ?? "-"}</td>
      <td className="p-2">{stop.lon ?? "-"}</td>
      <td className="p-2 space-x-2">
        <button 
          disabled={busy} 
          onClick={() => onComplete(stop.id)} 
          className="px-2 py-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Completar
        </button>
        <button 
          disabled={busy} 
          onClick={() => onFail(stop.id)} 
          className="px-2 py-1 rounded-md border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Fallar
        </button>
      </td>
    </tr>
  );
}
