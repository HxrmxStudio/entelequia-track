import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Courier",
  slug: "courier-app",
  version: "1.0.0",
  scheme: "courier",
  owner: undefined,
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash-icon.png",
    backgroundColor: "#ffffff",
    resizeMode: "contain",
  },
  updates: {
    url: undefined,
    enabled: true,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.entelequia.courier",
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "We use your location to track deliveries while you are using the app.",
      NSLocationAlwaysAndWhenInUseUsageDescription:
        "We need your location in the background to update your courier route and delivery status.",
      UIBackgroundModes: ["location", "processing"],
      NSCameraUsageDescription:
        "Camera access is required to scan QR/OTP and capture proof of delivery.",
      NSPhotoLibraryAddUsageDescription:
        "We need to save proof-of-delivery photos to your library.",
      NSPhotoLibraryUsageDescription:
        "Photo library access is required to attach media as proof of delivery.",
      NSBluetoothAlwaysUsageDescription: undefined,
      NSBluetoothPeripheralUsageDescription: undefined,
    },
  },
  android: {
    package: "com.entelequia.courier",
    permissions: [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "ACCESS_BACKGROUND_LOCATION",
      "FOREGROUND_SERVICE",
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "VIBRATE",
      "RECEIVE_BOOT_COMPLETED",
    ],
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },
  extra: {
    // Use EXPO_PUBLIC_* for runtime-safe envs
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3001",
    cableUrl: process.env.EXPO_PUBLIC_CABLE_URL ?? "ws://localhost:3001/cable",
  },
  plugins: [
    // Router plugin for Expo Router v3
    "expo-router",
    // Ensure permissions descriptions are auto-configured
    "expo-location",
    "expo-camera",
    "expo-notifications",
    "expo-media-library",
  ],
  experiments: {
    typedRoutes: true,
  },
};

export default config;


