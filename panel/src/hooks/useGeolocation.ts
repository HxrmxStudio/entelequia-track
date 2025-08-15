import { useCallback, useEffect, useRef, useState } from 'react';

export type Geostamp = { lat: number; lon: number; taken_at: string };

const CACHE_KEY = "geostamp_cache";
const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function useGeolocation() {
  const [geostamp, setGeostamp] = useState<Geostamp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);
  const watchId = useRef<number | null>(null);
  const fallbackTimer = useRef<number | null>(null);
  const hardTimer = useRef<number | null>(null);

  const capture = useCallback((options?: { force?: boolean }) => {
    const start = Date.now();
    console.log("[geo] capture start", { options });
    if (!('geolocation' in navigator)) {
      setError('Este navegador no soporta geolocalización');
      return;
    }
    setLoading(true);
    setError(null);
    // cache-first: if we have a fresh cached geostamp and not forcing refresh, use it immediately
    try {
      if (!options?.force) {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
          const cached = JSON.parse(raw) as { geostamp: Geostamp; ts: number };
          if (Date.now() - cached.ts < DEFAULT_TTL_MS) {
            setGeostamp(cached.geostamp);
            setLoading(false);
            return;
          }
        }
      }
    } catch {}
    // clear any previous watchers/timers
    console.log("[geo] clearing previous timers/watchers");
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (fallbackTimer.current) {
      window.clearTimeout(fallbackTimer.current);
      fallbackTimer.current = null;
    }
    if (hardTimer.current) {
      window.clearTimeout(hardTimer.current);
      hardTimer.current = null;
    }

    const success = (pos: GeolocationPosition) => {
      if (!mounted.current) return;
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const taken_at = new Date().toISOString();
      const next = { lat, lon, taken_at } as Geostamp;
      setGeostamp(next);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ geostamp: next, ts: Date.now() })); } catch {}
      setLoading(false);
      console.log("[geo] success", { lat, lon, accuracy: (pos.coords as any).accuracy, tookMs: Date.now() - start });
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      if (fallbackTimer.current) {
        window.clearTimeout(fallbackTimer.current);
        fallbackTimer.current = null;
      }
      if (hardTimer.current) {
        window.clearTimeout(hardTimer.current);
        hardTimer.current = null;
      }
    };

    const failure = (err: GeolocationPositionError) => {
      if (!mounted.current) return;
      const map: Record<number, string> = {
        1: 'Permiso de ubicación denegado',
        2: 'No se pudo determinar la ubicación',
        3: 'Tiempo de espera agotado al obtener la ubicación'
      };
      setError(map[err.code] || err.message || 'Fallo al obtener la ubicación');
      setLoading(false);
      console.log("[geo] error", { code: err.code, message: err.message, tookMs: Date.now() - start });
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      if (fallbackTimer.current) {
        window.clearTimeout(fallbackTimer.current);
        fallbackTimer.current = null;
      }
      if (hardTimer.current) {
        window.clearTimeout(hardTimer.current);
        hardTimer.current = null;
      }
    };

    // Disparamos estrategias en cascada para evitar cuelgues en desktop
    // 1) getCurrentPosition low accuracy (rápido / cacheable)
    try {
      console.log("[geo] getCurrentPosition (low accuracy)");
      navigator.geolocation.getCurrentPosition(success, failure, {
        enableHighAccuracy: false,
        timeout: 4_000,
        maximumAge: 60_000
      });
    } catch (e) {
      console.log("[geo] exception starting low-accuracy getCurrentPosition", e);
    }

    // 2) getCurrentPosition: alta precisión, en paralelo
    try {
      console.log("[geo] getCurrentPosition");
      navigator.geolocation.getCurrentPosition(success, failure, {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 0
      });
    } catch (e) {
      setError('Fallo al iniciar la geolocalización');
      setLoading(false);
      console.log("[geo] exception starting getCurrentPosition", e);
      return;
    }

    // 3) Fallback: si en 6s nada respondió, activar watchPosition baja precisión
    fallbackTimer.current = window.setTimeout(() => {
      if (!mounted.current) return;
      if (watchId.current !== null) return; // ya activo
      console.log("[geo] starting watchPosition fallback");
      watchId.current = navigator.geolocation.watchPosition(success, failure, {
        enableHighAccuracy: false,
        maximumAge: 30_000,
        timeout: 20_000
      });
    }, 6_000);

    // Hard timeout final de seguridad (12s)
    hardTimer.current = window.setTimeout(() => {
      if (!mounted.current) return;
      setLoading(false);
      setError('Tiempo de espera agotado al obtener la ubicación');
      console.log("[geo] hard-timeout hit", { tookMs: Date.now() - start });
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    }, 12_000);
  }, []);

  const reset = useCallback(() => {
    setGeostamp(null);
    setError(null);
  }, []);

  useEffect(() => {
    console.log("[geo] hook mounted");
    // hydrate from cache on mount if present
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as { geostamp: Geostamp; ts: number };
        if (Date.now() - cached.ts < DEFAULT_TTL_MS) {
          setGeostamp(cached.geostamp);
          console.log("[geo] hydrated from cache", cached.geostamp);
        }
      }
    } catch {}
    return () => {
      mounted.current = false;
      console.log("[geo] hook unmounted");
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      if (fallbackTimer.current) {
        window.clearTimeout(fallbackTimer.current);
        fallbackTimer.current = null;
      }
      if (hardTimer.current) {
        window.clearTimeout(hardTimer.current);
        hardTimer.current = null;
      }
    };
  }, []);

  return { geostamp, error, loading, capture, reset };
}