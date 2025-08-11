## Courier App (Expo)

Requisitos:

- Node 18+
- Expo CLI (`npm i -g expo` opcional)

### Variables de entorno

Copiar `env.example` a `.env` y ajustar si es necesario.

```
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_CABLE_URL=ws://localhost:3001/cable
```

### Scripts

- `npm start` – Inicia Metro bundler
- `npm run android|ios|web` – Abre plataformas
- `npm run lint` – Linter
- `npm run format` – Prettier
- `npm run typecheck` – TypeScript
- `npm test` – Tests con Jest

### Estructura

- `app/` – Rutas con `expo-router`
- `src/core` – Proveedores y clientes base (React Query)
- `src/services` – HTTP, realtime (ActionCable), location (bg), media, notifications, queue offline
- `src/stores` – Zustand (auth)
- `src/utils` – Utilidades

### Notas

- Autenticación: `POST /auth/login` devuelve `{ token, role }`.
- Realtime: canal `RealtimeChannel` en `/cable`.
- Ubicación: se solicita permiso foreground/background y se define `courier-location-task`.


