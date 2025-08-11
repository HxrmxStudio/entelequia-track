import { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/stores/auth";
import { startForegroundUpdates, ensureLocationPermissions } from "@/services/location";
import { connectRealtime, subscribeRealtime } from "@/services/realtime";

export default function HomeScreen() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const consumer = connectRealtime(token ?? undefined);
    const unsubscribe = subscribeRealtime(consumer, {
      onHello: (payload) => {
        console.warn("Realtime hello:", payload);
        setConnected(true);
      },
    });
    return () => unsubscribe();
  }, [token]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Courier Home</Text>
      <Text>Realtime: {connected ? "connected" : "connecting..."}</Text>
      <Button
        title="Login"
        onPress={() => router.push("/login")}
      />
      <View style={{ height: 12 }} />
      <Button
        title="Enable Location"
        onPress={async () => {
          const granted = await ensureLocationPermissions();
          if (granted) {
            await startForegroundUpdates();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 12 },
});


