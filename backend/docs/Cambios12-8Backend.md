### Resumen de cambios (backend)

#### Objetivo
- Robustecer OTP para POD (TTL, throttling, lock y conteo de intentos).
- Validar geocerca con PostGIS de forma segura y precisa.
- Endurecer controladores (códigos HTTP correctos, no filtrar información sensible).
- Eliminar rutas duplicadas.
- Alinear migraciones con prácticas seguras e índices adecuados.

---

### Archivos modificados

- `backend/app/services/geofence_service.rb`
- `backend/app/services/otp_service.rb`
- `backend/app/controllers/shipments_controller.rb`
- `backend/app/controllers/proofs_controller.rb`
- `backend/config/routes.rb`
- `backend/db/migrate/20250812104955_add_otp_and_controls_to_shipments.rb`
- `backend/app/controllers/track_controller.rb` (ajuste menor)

---

### Detalle por archivo

#### `backend/app/services/geofence_service.rb`
- Cálculo de distancia con SRID explícito y conversión a `geography`.
- SQL parametrizado con `sanitize_sql_array`.
- Resultado tipado `Result` con `inside`, `distance_m`, `radius_m`.
- Manejo nulo: si no hay `geom` de destino, no bloquea (retorna `inside: true` con radio).

#### `backend/app/services/otp_service.rb`
- `generate!`:
  - Validación de longitud [4..8].
  - Chequeo de `locked?`.
  - Throttling con `OTP_REGEN_THROTTLE_SECONDS`.
  - TTL configurable con `OTP_TTL_MINUTES`; setea `otp_generated_at` y `otp_expires_at`.
  - Persiste `otp_code_hash` (SHA256), resetea intentos y lock.
- `verify!`:
  - Rechaza si `locked` o `expired`.
  - Incrementa intentos al fallar; aplica lock si supera `OTP_MAX_ATTEMPTS` con `OTP_LOCK_MINUTES`.
- Nuevos helpers: `expired?`, endurecimiento en `inc_attempt!` (casts, límites positivos).
- Sin logs sensibles (no se expone el OTP).

#### `backend/app/controllers/shipments_controller.rb`
- `otp`:
  - No devuelve el OTP por API.
  - Errores explícitos:
    - `otp_locked` (423 Locked).
    - `otp_throttled` (429 Too Many Requests).
    - `otp_generation_failed` (422 Unprocessable Entity).
  - Log neutro: “OTP generated for shipment=ID”.

#### `backend/app/controllers/proofs_controller.rb`
- `create`:
  - Requiere `method` y normaliza inputs (`lat`, `lon`, `captured_at`).
  - OTP:
    - Valida requerido.
    - Rechaza si locked (423).
    - Captura expirado y devuelve `otp_expired` (422).
    - Rechaza inválido (422).
  - QR:
    - Valida requerido.
    - Compara con `secure_compare` usando `to_s` para evitar `nil` issues.
  - Foto/firma:
    - Firma requerida si `method=signature` (422).
    - Carga foto con `PodUploader` si presente.
  - Hash antifraude:
    - Construye `hash_chain` con campos disponibles (sin referencias a columnas inexistentes).
  - Geofencing:
    - Para `otp`/`qr`: si hay `lat`/`lon`, valida con `GeofenceService`; fuera de geocerca -> `outside_geofence` (422).
  - Estado:
    - Marca `delivered` y limpia `eta` en `otp`/`qr` exitosos.
  - Errores:
    - `shipment_not_found` (404) para `RecordNotFound`.
    - Fallback `proof_creation_failed` (422) con log del error.

#### `backend/config/routes.rb`
- Eliminado bloque duplicado de `resources :shipments`.
- Estructura final:
  - `resources :shipments` con `member { post :assign, post :otp }`.
  - `resources :proofs`, `resources :events` bajo `module: :shipments`.
  - Mantiene endpoints existentes (`auth`, `health`, `imports`, `realtime`, `public/track/:code`).

#### `backend/db/migrate/20250812104955_add_otp_and_controls_to_shipments.rb`
- Migración reversible (`up/down`) con `disable_ddl_transaction!` para índices concurrentes.
- Nuevas columnas en `shipments`:
  - `otp_attempts` (default 0, null: false)
  - `otp_locked_until`
  - `geofence_radius_m` (default 100, null: false)
  - `otp_code_hash` (limit 128)
  - `otp_generated_at`
  - `otp_expires_at`
  - `qr_token` (limit 128)
- Índices:
  - `qr_token` único (concurrently).
  - `otp_expires_at` (concurrently).
- `down` remueve índices (sin algoritmo) y columnas en orden seguro.

#### `backend/app/controllers/track_controller.rb`
- Coerción defensiva de `params[:code]` a `String` al buscar por `qr_token`.

---

### Cambios de comportamiento (API)
- Generación OTP:
  - 200 OK: `{ ok: true }` (no devuelve código).
  - 423 Locked: `{ error: "otp_locked" }`.
  - 429 Too Many Requests: `{ error: "otp_throttled" }`.
  - 422 Unprocessable Entity: `{ error: "otp_generation_failed" }`.
- POD (`/shipments/:id/proofs`):
  - OTP inválido: 422 `{ error: "otp_invalid" }`.
  - OTP expirado: 422 `{ error: "otp_expired" }`.
  - OTP locked: 423 `{ error: "otp_locked" }`.
  - QR faltante/mismatch: 422 `{ error: "qr_required" | "qr_mismatch" }`.
  - Fuera de geocerca: 422 `{ error: "outside_geofence", distance_m, radius_m }`.
  - Creación: 201 `{ ok: true, proof_id, photo_url }`.
- Tracking público:
  - 404 `{ error: "not_found" }` para token inexistente.

---

### Seguridad y performance
- Evita exponer OTP en logs o respuestas.
- Comparaciones con `secure_compare` para QR token.
- PostGIS con SRID explícito y SQL parametrizado para mitigar inyecciones.
- Índices para `qr_token` y `otp_expires_at`.
- Manejo de errores consistente y códigos HTTP apropiados.

---

### Variables de entorno sugeridas
- `OTP_MAX_ATTEMPTS=3`
- `OTP_LOCK_MINUTES=15`
- `OTP_TTL_MINUTES=10`
- `OTP_REGEN_THROTTLE_SECONDS=60`
- `GEOFENCE_DEFAULT_M=100`