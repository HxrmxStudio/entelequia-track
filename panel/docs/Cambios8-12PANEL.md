Voy a crear el hook `useMapLibre` y refactorizar las dos páginas para usarlo, asegurando limpieza de recursos y sin duplicar lógica. Luego validaré lints de los archivos afectados.
Ran tool
Ran tool
Ran tool
Ran tool
- Caminé por el bosque mental y listo.

<CONTEMPLATOR>
Empezando por lo básico. El objetivo: unificar la lógica de MapLibre sin duplicación y respetar la regla de no incluir lógica de red en componentes. Ya habíamos movido el fetch del tracking público a `services`. Falta encapsular la creación, limpieza y referencia del mapa.

Pienso en un hook `useMapLibre` que:
- reciba el `containerRef`, `center`, `zoom`, y opcional `styleUrl`.
- cree el mapa una sola vez cuando el contenedor esté disponible.
- maneje cleanup con `map.remove()` al desmontar.
- exponga la instancia para que el componente añada markers o cambie el centro.

Detalles: el hook debe ser cliente (`"use client"`), importar CSS, y no recrear el mapa en cada render. Para evitar recreaciones, controlo dependencias del `useEffect` y retorno `mapRef.current` desde un `useRef`.

Siguiente, refactor de dos páginas:
- En `dashboard`, reemplazo la inicialización repetida por `useMapLibre`, mantengo la suscripción a ActionCable condicionada a que el `map` exista y muevo markers sobre esa instancia. Cleanup de la suscripción se mantiene.
- En la página pública `[code]`, creo el mapa con un centro por defecto; una vez que llegan datos, agrego markers y ajusto el centro si hay destino. Se mantiene la lógica de fetch tipada por servicio.

Compruebo que `maplibre-gl/dist/maplibre-gl.css` esté importado una sola vez. El hook lo hace; quito los otros imports de CSS en las páginas.

Alias `@/*`: Para servicios, uso `@/services/...` consistente con `tsconfig`. Los archivos bajo `panel/src/services/track` existen. El import del servicio en la página pública ya usa alias. La suscripción y API interna no requieren cambios.

Reviso lints. Sin errores.

Pienso en edge cases:
- El hook crea mapa sólo una vez con parámetros iniciales. Si cambian `center/zoom` por props, no se re-crea. Es intencional; si necesitamos reaccionar a cambios, podríamos añadir efectos que llamen `map.setCenter`/`map.setZoom` según props.
- El dashboard añade markers con cada ping; sin deduplicación intencional porque el objetivo era simplicidad. Si llega a ser un problema de performance, consideraríamos capas/vector tiles o actualizar una fuente de datos.
- Para el público, ajusto el centro tras la llegada de datos. Lo hago con `map.setCenter`, no re-inicializo mapa.

Sigo. El usuario borró accidentalmente archivos bajo `panel/src/services/track` según “attached_files” previos, pero ya están restaurados y los imports funcionan.

Repaso los principios:
- SRP: hook maneja mapa; componentes UI quedan limpios.
- DRY: elimina duplicación de inicialización y cleanup.
- KISS: API del hook pequeña.
- Next/Tailwind/TS: cliente, CSS centralizado, tipos estrictos, clases Tailwind en lugar de estilos inline.

Todo encaja. Ahora listo para reportar cambios y añadir esta unificación a la lista total de cambios.
</CONTEMPLATOR>

<FINAL_ANSWER>
- Cambios realizados para unificar `useMapLibre`:
  - Creado `panel/src/app/lib/useMapLibre.ts`:
    - Hook cliente que inicializa MapLibre una sola vez, importa CSS, expone `map` y realiza cleanup con `map.remove()`.
    - Firma:
      ```ts
      useMapLibre({ containerRef, center, zoom, styleUrl? })
      ```
  - Refactor en `panel/src/app/dashboard/page.tsx`:
    - Reemplazo de creación manual del mapa por:
      ```ts
      const { map } = useMapLibre({ containerRef: mapDiv, center: [-58.3816, -34.6037], zoom: 10 });
      ```
    - Suscripción a ActionCable condicionada a `map`, markers agregados sobre `map`, cleanup de la suscripción mantenido.
    - Eliminado el import redundante de CSS de MapLibre a favor del del hook.
    - Reemplazo de altura inline por Tailwind `h-[480px]`.
  - Refactor en `panel/src/app/t/[code]/page.tsx`:
    - Reemplazo de creación manual del mapa por:
      ```ts
      const { map } = useMapLibre({ containerRef: mapDiv, center: [-58.3816, -34.6037], zoom: 12 });
      ```
    - Al cargar `data`, agrego markers y ajusto el centro con `map.setCenter`.
    - Eliminado el import redundante de CSS de MapLibre; se centraliza en el hook.
    - Mantengo servicio `fetchPublicTrack` para obtener datos, sin fetch directo en componente.
    - Reemplazo de altura inline por Tailwind `h-[380px]`.

- Lista completa de cambios realizados hasta ahora:
  - Mover la llamada de red de la página pública a la capa de servicios:
    - Nuevos archivos:
      - `panel/src/services/track/types.ts` (define `PublicTrack`)
      - `panel/src/services/track/endpoints.ts` (define `publicTrack(code)`)
      - `panel/src/services/track/actionService.ts` (función `fetchPublicTrack`)
    - Actualización de `panel/src/app/t/[code]/page.tsx` para usar servicio y tipos, con control de montaje y manejo de errores.
  - Integración MapLibre consistente:
    - Import centralizado de `maplibre-gl/dist/maplibre-gl.css` dentro del hook.
    - Limpieza de mapa con `map.remove()` encapsulada en el hook.
    - Reemplazo de estilos inline por clases Tailwind en contenedores del mapa.
  - Ajuste de ActionCable:
    - `panel/src/app/lib/cable.ts`: `CABLE_URL` por defecto `ws://localhost:3000/cable`, configurable por `NEXT_PUBLIC_CABLE_URL`.
  - Unificación con `useMapLibre`:
    - Creado `panel/src/app/lib/useMapLibre.ts`.
    - Refactor en `panel/src/app/dashboard/page.tsx` y `panel/src/app/t/[code]/page.tsx` para usar el hook.
  - Linter: verificado sin errores en archivos tocados.

- Por qué estos cambios:
  - SRP/SoC: componentes renderizan UI; servicios gestionan red; hook gestiona el mapa.
  - DRY: evita duplicar inicialización y cleanup de MapLibre.
  - KISS: interfaz pequeña y clara del hook.
  - Next.js/TS/Tailwind:
    - Cliente donde corresponde.
    - Tipos estrictos y rutas alias `@/*`.
    - Tailwind para estilos en lugar de inline.

- Mejoras futuras sugeridas:
  - Añadir soporte opcional en `useMapLibre` para reaccionar a cambios en `center`/`zoom` via `map.setCenter`/`map.setZoom`.
  - Extraer utilidades para markers (por ejemplo, actualización en tiempo real con fuentes GeoJSON).
  - Validación con Zod en responses del servicio.
  - Manejar estados de error con UI dedicada (skeletons/toasts) y React Query si se requiere caching.

¿Quieres que añada un pequeño helper para actualizar dinámicamente el centro/zoom desde props en el hook?