import * as Camera from "expo-camera";
import * as MediaLibrary from "expo-media-library";

export async function ensureCameraPermissions(): Promise<boolean> {
  const [permission] = Camera.useCameraPermissions();
  const status = permission?.status ?? "undetermined";
  const media = await MediaLibrary.requestPermissionsAsync();
  return status === "granted" && media.status === "granted";
}

export async function saveAssetAsync(uri: string): Promise<void> {
  await MediaLibrary.saveToLibraryAsync(uri);
}


