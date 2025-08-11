import * as TaskManager from "expo-task-manager";
import type { LocationObject } from "expo-location";
import { BACKGROUND_TASK_NAME } from "@/services/location";
import { queueEnqueue } from "@/services/queue";

TaskManager.defineTask(BACKGROUND_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("Location task error", error);
    return;
  }
  const locations = (data as any)?.locations as LocationObject[] | undefined;
  if (!locations || locations.length === 0) return;
  const latest = locations[locations.length - 1];

  await queueEnqueue({
    type: "location_ping",
    payload: {
      lat: latest.coords.latitude,
      lon: latest.coords.longitude,
      accuracy: latest.coords.accuracy ?? undefined,
      speed: latest.coords.speed ?? undefined,
      ts: new Date(latest.timestamp).toISOString(),
    },
  });
});


