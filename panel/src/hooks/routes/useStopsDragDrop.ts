import { useCallback, useState } from "react";
import { resequenceStops } from "@/services/stops/resequenceStops";
import type { StopItem } from "@/services/stops/types";

function reorder(ids: string[], sourceId: string, targetId: string): string[] {
  const from = ids.indexOf(sourceId);
  const to = ids.indexOf(targetId);
  if (from === -1 || to === -1) return ids;
  const copy = ids.slice();
  const [moved] = copy.splice(from, 1);
  copy.splice(to, 0, moved);
  return copy;
}

export function useStopsDragDrop(
  routeId: string, 
  stops: StopItem[], 
  onStopsUpdate: (stops: StopItem[]) => void
) {
  const [dragId, setDragId] = useState<string | null>(null);

  const onDragStart = useCallback((e: React.DragEvent<HTMLTableRowElement>, stopId: string) => {
    setDragId(stopId);
    e.dataTransfer.setData("text/plain", stopId);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(async (e: React.DragEvent<HTMLTableRowElement>, targetId: string) => {
    e.preventDefault();
    const sourceId = dragId || e.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === targetId) return;
    
    const orderedStops = [...stops].sort((a, b) => a.sequence - b.sequence);
    const newOrder = reorder(orderedStops.map(s => s.id), sourceId, targetId);
    
    try {
      const updated = await resequenceStops(routeId, { order: newOrder });
      onStopsUpdate(updated);
    } catch (e: unknown) {
      console.error("Failed to resequence stops:", e);
    } finally {
      setDragId(null);
    }
  }, [dragId, stops, routeId, onStopsUpdate]);

  return { 
    onDragStart, 
    onDragOver, 
    onDrop 
  };
}
