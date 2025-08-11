import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { sendLocationPing } from "@/services/locationPing";

export const BACKGROUND_TASK_NAME = "courier-location-task";

export async function ensureLocationPermissions(): Promise<boolean> {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== "granted") return false;
  const bg = await Location.requestBackgroundPermissionsAsync();
  return bg.status === "granted";
}

export async function startForegroundUpdates(): Promise<void> {
  await Location.startLocationUpdatesAsync(BACKGROUND_TASK_NAME, {
    accuracy: Location.Accuracy.High,
    timeInterval: 15_000,
    distanceInterval: 25,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: "Active delivery tracking",
      notificationBody: "Location tracking is active for your deliveries.",
    },
  });
}

export async function stopLocationUpdates(): Promise<void> {
  const started = await Location.hasStartedLocationUpdatesAsync(BACKGROUND_TASK_NAME);
  if (started) await Location.stopLocationUpdatesAsync(BACKGROUND_TASK_NAME);
}

// Separate file registers the TaskManager handler.


