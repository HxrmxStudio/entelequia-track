import type { StopItem } from "@/services/stops/types";
import { StopRow } from "./StopRow";

interface StopsTableProps {
  stops: StopItem[];
  onDragStart: (e: React.DragEvent<HTMLTableRowElement>, stopId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLTableRowElement>) => void;
  onDrop: (e: React.DragEvent<HTMLTableRowElement>, stopId: string) => void;
  onComplete: (stopId: string) => void;
  onFail: (stopId: string) => void;
  busy: boolean;
}

export function StopsTable({ 
  stops, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  onComplete, 
  onFail, 
  busy 
}: StopsTableProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 text-sm bg-white shadow-sm text-gray-800">
      <h2 className="font-semibold mb-2">Paradas</h2>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="text-left p-2">#</th>
              <th className="text-left p-2">Estado</th>
              <th className="text-left p-2">ETA</th>
              <th className="text-left p-2">Dirección</th>
              <th className="text-left p-2">Lat</th>
              <th className="text-left p-2">Lon</th>
              <th className="text-left p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {stops.map(stop => (
              <StopRow
                key={stop.id}
                stop={stop}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDrop={onDrop}
                onComplete={onComplete}
                onFail={onFail}
                busy={busy}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
