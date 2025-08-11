import AsyncStorage from "@react-native-async-storage/async-storage";
import { sendLocationPing } from "@/services/locationPing";

type QueueItem =
  | { type: "location_ping"; payload: { lat: number; lon: number; ts: string; accuracy?: number; speed?: number } };

const STORAGE_KEY = "offline-queue-v1";

export async function queueEnqueue(item: QueueItem): Promise<void> {
  const current = await loadQueue();
  current.push(item);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export async function queueFlush(): Promise<void> {
  const current = await loadQueue();
  const remaining: QueueItem[] = [];
  for (const item of current) {
    try {
      if (item.type === "location_ping") await sendLocationPing(item.payload);
    } catch (e) {
      remaining.push(item);
    }
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
}

async function loadQueue(): Promise<QueueItem[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueueItem[];
  } catch {
    return [];
  }
}


