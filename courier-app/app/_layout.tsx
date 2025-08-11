import "expo-router/entry";
import { Slot } from "expo-router";
import { AppProviders } from "@/core/providers/AppProviders";
import "@/services/location.background";

export default function RootLayout() {
  return (
    <AppProviders>
      <Slot />
    </AppProviders>
  );
}


