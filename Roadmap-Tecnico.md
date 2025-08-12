# 📍 Proyecto Entelequia-Track — Instrucciones Persistentes

## 🎯 Rol de la IA
Eres un **desarrollador técnico asistente** trabajando junto al developer manager.  
Debes proponer y aplicar cambios directamente en el código del proyecto siguiendo este documento como **fuente de verdad única**.

**Reglas clave:**
1. Mantén **principios DRY, KISS y SRP** en todo el código.
2. Respeta la arquitectura:
   - **Backend:** Rails API + Postgres/PostGIS + Redis/Sidekiq.
   - **Frontend panel:** Next.js.
   - **App móvil:** Expo.
3. Toda lógica de llamadas a API en frontend debe estar en `services/endpoints.ts`, `services/types.ts`, `services/actions/*.ts`.
4. En backend Rails, preservar modularidad (services, serializers, policies, etc.).
5. La IA debe **documentar cada cambio** explicando **qué se hizo** y **por qué**.
6. No desarrollar funcionalidades de sprints futuros sin completar los previos.
7. Respetar roles y autenticación JWT + RBAC.

---

## 🚀 Roadmap y Sprints

### **Sprint 0 — Fundaciones (Infra + Esqueleto) — 3–4 días**
**Entregables:**
- Repos: backend (Rails API + Postgres/PostGIS + Redis/Sidekiq), panel (Next.js), courier-app (Expo).
- Entornos: staging (SA) + prod; S3 (fotos POD), CDN para assets.
- Observabilidad: Sentry + logs estructurados; healthchecks.
- Esqueleto DB: `orders`, `shipments`, `stops`, `couriers`, `locations`, `proofs`, `events`, `imports`.

**Criterios:**
- CI/CD deploy en staging.
- PostGIS activo + índices GiST (`locations.geom`, `proofs.geom`).
- Auth JWT (courier) + RBAC (panel).

---

### **Sprint 1 — CSV Import con mapeo + dry-run — 1 semana**
**Entregables:**
- UI importación (panel): subir CSV → mapeo columnas → dry-run con errores resaltados → commit.
- Soporte 2 plantillas: “encabezados actuales” y “normalizada”.
- Servicio `CsvImporter` con validaciones (fecha, monto, catálogos, duplicados).
- Historial de importaciones + descarga de rechazados.

**Criterios:**
- Upsert por `order_id`.
- Dry-run < 5s para 5k filas; commit batched con Sidekiq.
- Métricas lote: insertados / actualizados / rechazados.

---

### **Sprint 2 — Tiempo real + Courier App base — 1–1.5 semanas**
**Entregables:**
- Locations API idempotente (`courier_id`, `ts`) + almacenamiento GEOGRAPHY.
- Courier app: login, ruta de hoy, detalle parada, tracking en background.
- Android: Foreground Service (`type=location`).
- iOS: Background Modes + Significant Change.
- Batch offline + reintentos.
- Dashboard live (panel): mapa en tiempo real (SSE/WebSocket).
- Alertas SLA iniciales: GPS offline > N min.

**Criterios:**
- Ping estable background 60–120s en movimiento; consumo batería medido.
- Mapa panel actualiza en <2s tras ping.

---

### **Sprint 3 — POD robusto + Tracking público — 1.5 semanas**
**Entregables:**
- POD: QR/OTP (6 dígitos), foto obligatoria, geostamp, firma opcional.
- OTP: máx 3 intentos → bloqueo + override supervisor.
- Geofence configurable: 75–100m urbano / 150–250m suburbano.
- Device binding (`device_hash`).
- Hash inviolable `{shipment_id, ts, lat, lon, method}`.
- Tracking page pública (link SMS): live dot + ETA + contacto + “reportar incidencia”.
- Regenerar OTP/QR desde panel; timeline eventos.

**Criterios:**
- No marcar entrega sin foto + geostamp dentro de radio.
- Tracking público responde < 500ms con caché.

---

### **Sprint 4 — Analytics v0 + Webhooks + Pulido — 1–1.5 semanas**
**Entregables:**
- KPIs v0 (panel Analytics): fulfillment, on-time, first-attempt, avg delivery time, ETA error, OTP match, foto/geostamp compliance, GPS uptime por courier.
- Webhooks (estilo Onfleet/Shipday) + verificación header secreto:
  - `shipment.updated`, `eta.updated`, `delivered`, `pod.failed`, `gps.offline`, `import.finished`.
- Alertas SLA ampliadas: retraso pickup/arribo, ETA desviada, fallos POD.
- Cost controls: MapLibre/MapTiler; lifecycle S3→Glacier 60–90 días; SMS proveedor local AR.

**Criterios:**
- Dashboard filtra por fecha/zona/repartidor.
- Webhooks con reintento exponencial + idempotencia.
- Informe semanal auto (CSV/PDF) por correo interno.

---

## 🛠 Hardening & Piloto — 3–5 días
- Test en campo con 2 repartidores reales (Android foco).
- Ajuste intervalos GPS y radio geofence por zonas.
- UX tuning: escaneo QR en baja luz, accesos rápidos (llamar/WhatsApp), estados error offline.

---

## 📐 Ajustes de diseño y UX
- **Import UX:** mapeo columnas + dry-run con reporte descargable.
- **POD Flow:** Scan QR / ingresar OTP → foto(s) → geostamp → submit + cola offline.
- **Tracking público:** link SMS, dot en vivo, ETA.
- **Eventos/Realtime:** SSE/WebSocket + webhooks firmados.
- **Antifraude:** OTP 3 intentos, geofence configurable, device binding, hash pruebas, alerta GPS offline.
- **Costos:** MapLibre/OSM, SMS local, S3 lifecycle → Glacier.

---

## 📊 KPIs — Día 1

### Operación y Servicio
- Fulfillment rate = entregados / creados.
- On-time rate = entregas dentro de SLA.
- First-attempt success = entregas exitosas en primer intento.
- Avg delivery time = delivered_at - out_for_delivery_at.
- ETA error medio (|ETA-real|).
- Cancel rate y reprogramados.

### Antifraude / Calidad POD
- OTP/QR match rate.
- Foto obligatoria cumplida (% entregas con foto).
- Geostamp compliance (% entregas dentro de radio definido, ej. <50 m).
- Disputes rate y chargebacks.
- Anomalías: fuera de radio, sin foto, sin OTP, hora fuera de ventana.

### Performance de repartidores
- Productividad = paradas completadas / hora.
- Tiempo ocioso (sin movimiento y sin parada).
- Distancia por entrega (km / drop).
- Bounce rate (fallidas / intentadas).
- Uptime de tracking (minutos con ping válido / ventana laboral).

### Costos
- Costo por entrega (si cargamos coste).
- Coste mapa/SDK (si aplica), coste SMS/push por envío.

---

## 🖥 Pantallas MVP

### Web interna (Panel)
- Login / Roles (admin, ops).
- Dashboard en vivo: mapa con repartidores y rutas, lista de envíos por estado + alertas SLA.
- Órdenes: listado + detalle, crear/editar, ver historial y eventos.
- Envíos (Kanban): pending → out_for_delivery → delivered/failed.
- Importar CSV: subir archivo, dry-run, confirmar, descargar rechazados.
- Planificación de rutas: asignar paradas y secuencia por repartidor.
- Repartidores: alta/baja, estado, últimos pings, métricas personales.
- Analytics: KPIs día 1 + filtros.
- Configuración: catálogos (status, delivery_method), radios geográficos, ventanas de entrega, plantillas CSV.

### App Repartidor (Expo)
- Login (email+PIN o código).
- Ruta de hoy (lista de paradas con orden sugerido).
- Detalle de parada: navegar (deep link a Maps), llamar/WhatsApp, notas.
- Entrega: escanear QR o ingresar OTP, foto obligatoria, firma opcional, comentarios; marcar delivered/failed.
- Estado de tracking: toggle on/off (solo en horario), indicador de background OK.
- Incidencias: marcar “no contesta”, “dirección incorrecta”, etc.
- Perfil: cerrar sesión, device info.

---

## 🔌 Endpoints MVP (v1)

### Auth
```

POST /api/v1/auth/login → {token, role}
POST /api/v1/auth/logout

```

### Orders
```

GET  /api/v1/orders?status=\&q=\&page=
POST /api/v1/orders
GET  /api/v1/orders/\:id
PUT  /api/v1/orders/\:id

```

### Shipments
```

GET  /api/v1/shipments?status=\&courier\_id=\&page=
POST /api/v1/shipments
GET  /api/v1/shipments/\:id (incluye timeline/events)
PUT  /api/v1/shipments/\:id
POST /api/v1/shipments/\:id/assign {courier\_id}
POST /api/v1/shipments/\:id/otp

```

### Routes & Stops
```

GET  /api/v1/routes?date=\&courier\_id=
POST /api/v1/routes {courier\_id, date, stops\[]}
PUT  /api/v1/routes/\:id/resequence
GET  /api/v1/stops/\:id
PUT  /api/v1/stops/\:id

```

### Events (timeline)
```

POST /api/v1/shipments/\:id/events {kind, metadata}
kind: picked\_up | on\_route | delayed | delivered | failed

```

### Proofs (POD)
```

POST /api/v1/shipments/\:id/proofs
Payload (multipart): otp\_or\_qr, photo, signature?, lat, lng, timestamp
Validación: match OTP/QR, radio geográfico, guardar foto en S3.

```

### Locations (pings)
```

POST /api/v1/locations {courier\_id, lat, lng, speed?, accuracy?, recorded\_at}
GET  /api/v1/couriers/\:id/locations?from=\&to=

```

### Couriers
```

GET  /api/v1/couriers
POST /api/v1/couriers
GET  /api/v1/couriers/\:id
PUT  /api/v1/couriers/\:id

```

### Imports (CSV)
```

POST /api/v1/imports/orders/dry\_run
POST /api/v1/imports/orders/commit
GET  /api/v1/imports/\:id

```

### Webhooks
```

POST /api/v1/webhooks/orders

```

### Realtime
```

GET /api/v1/realtime/stream (SSE) ó /ws (WebSocket)
Eventos: shipment.updated, courier.location, sla.alert, import.finished

```

---

## 📝 Notas Transversales
- Autenticación JWT en app.
- RBAC en panel.
- Paginación y filtros estándar.
- Tracing.
- Idempotencia en `locations` e `imports`.
- Validaciones antifraude y de integridad.

---

## ⚠ Riesgos y Mitigaciones
| Riesgo | Mitigación |
|--------|------------|
| Battery drain | Intervalos adaptativos, Significant Change, pings solo en movimiento |
| Conectividad | Batching local, reintentos, UI offline-first |
| Privacidad | Tracking solo con shift ON, consentimiento explícito |
| Coste SMS/mapas | Proveedor local + MapLibre, push notifications como alternativa |
| Fraude residual | 2 fotos en “leave at door”, ampliar controles si hay disputas |
```

