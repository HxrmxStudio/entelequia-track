import { useEffect, useState } from "react";
import { listCouriers } from "@/services/couriers/listCouriers";

export function useCouriers() {
  const [couriers, setCouriers] = useState<ReadonlyArray<{ id: string; name: string }>>([]);
  const [courierId, setCourierId] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const cs = await listCouriers({ active: true });
        setCouriers(cs);
      } catch {
        // Silently handle error as in original implementation
      }
    })();
  }, []);

  return {
    couriers,
    courierId,
    setCourierId
  };
}
