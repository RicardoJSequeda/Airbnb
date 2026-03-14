# Análisis del flujo de creación de anuncio (alojamiento)

## Resumen ejecutivo

- **No** se guarda cada paso del wizard en base de datos.
- El flujo actual guarda avance en **localStorage** durante el proceso y solo intenta crear el anuncio en BD al final.
- La creación en backend se realiza en `POST /dashboard/properties` y el registro queda en estado `DRAFT`.
- El anuncio para marketplace público solo aparece cuando se publica (`PUBLISHED`) y se consulta por `/public/properties`.

## 1) ¿Cada paso se guarda en BD?

### Estado actual

En el frontend (`/host/alojamiento`):

- Cada cambio del wizard se persiste en `localStorage` (`host-draft-accommodation`) usando `useEffect`.
- El backend se invoca al final del flujo, en el último paso, al presionar **Siguiente**.

Conclusión:

- **Cada paso NO se guarda en BD**.
- **Cada paso SÍ se guarda localmente** para no perder progreso.

## 2) ¿Cómo se crea el anuncio en backend?

1. El frontend llama `propertiesApi.create(...)`.
2. Se envía `POST /dashboard/properties` con token y contexto de organización.
3. En backend:
   - `PropertiesController.create` delega a `PropertiesService.create`.
   - `CreatePropertyUseCase` orquesta la creación.
   - `PrismaPropertiesRepository.create` guarda en tabla `property` y relaciones de amenities/imágenes.
4. El estado inicial de la propiedad es `DRAFT`.

## 3) ¿Cómo se muestra luego en páginas?

### Dashboard host (`/host/listings`)

- Consulta `propertiesApi.getMyProperties()` → `/dashboard/properties`.
- Lista propiedades de la organización autenticada.
- Muestra estado `En progreso` para `DRAFT` y `Publicado` para `PUBLISHED`.

### Marketplace público (`/search`, `/properties/:id`)

- Consulta endpoints públicos `/public/properties`.
- El backend filtra por `status: 'PUBLISHED'`.
- Una propiedad recién creada (DRAFT) no se verá en la búsqueda pública hasta publicarse.

## 4) Problemas detectados y mejoras aplicadas

### Problema 1: sensación de “se queda pegado” al finalizar

- El botón se bloqueaba durante submit y no siempre era claro para el usuario.

**Mejora aplicada:**

- Indicador visual de envío (`Guardando...`) y banner informativo/error para reintento.
- Timeout del `create` para evitar espera indefinida.

### Problema 2: desincronización por caché en listados

- Los listados de propiedades usan Redis cache.
- Sin invalidación, podía verse una lista vieja justo después de crear/publicar.

**Mejora aplicada (backend):**

- Versionado de claves de caché para listados por organización y públicos.
- `PropertiesService` incrementa versión al crear/actualizar/eliminar/publicar, forzando recálculo de lista.

## 5) Revisión de arquitectura backend

La arquitectura por capas se mantiene:

- **Controller**: entrada HTTP.
- **Service**: orquestación y políticas transversales.
- **UseCase/Query**: aplicación.
- **Repository (Prisma)**: infraestructura/persistencia.

Mejora arquitectónica incorporada:

- Invalidación de caché centralizada en `PropertiesService` (lugar correcto para coordinar cambios de lectura/escritura), evitando lógica de cache-invalidation dentro de controladores o componentes frontend.

## 6) Recomendación siguiente (opcional, no implementada aquí)

Si se requiere que “cada paso” realmente quede en BD (y no solo local), conviene agregar:

- Endpoint de **draft incremental** (`PATCH /dashboard/properties/:id/draft`) con DTO parcial.
- Creación temprana de `property` (draft mínimo) y actualización por etapas.
- Reanudación multi-dispositivo sin depender de localStorage.

