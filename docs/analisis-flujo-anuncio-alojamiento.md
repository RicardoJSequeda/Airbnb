# Análisis del proyecto y flujo de creación de anuncio de alojamiento

## 1) Panorama del proyecto

- Monorepo con `pnpm` + Turborepo.
- Frontend en `apps/web` (Next.js App Router) y backend en `apps/api-gateway` (NestJS + Prisma).
- El dominio de alojamientos vive principalmente en el módulo `properties` del backend y en el flujo `host/alojamiento` del frontend.

## 2) Flujo funcional (alto nivel)

1. El usuario entra por `/host` y abre el modal para elegir qué quiere publicar.
2. Selecciona alojamiento y pasa por onboarding en `/host/onboarding?type=alojamiento`.
3. Presiona **Comencemos** y entra al wizard `/host/alojamiento`.
4. Completa 19 pasos (tipo de propiedad, ubicación, básicos, amenities, fotos, título, descripción, precios, seguridad y datos finales).
5. En el último paso, el frontend compone un payload y llama `propertiesApi.create` → `POST /dashboard/properties`.
6. Si falla, conserva borrador en `localStorage`; en cualquier caso redirige a `/host/listings`.

## 3) Detalle técnico del flujo de creación

### 3.1 Entrada y autenticación

- El onboarding valida autenticación con `useAuthStore`; si no hay sesión, redirige a `/login?redirect=...`.
- El cliente API (`axios`) inyecta token `Bearer` desde `localStorage` (`auth-storage`) en cada request.

### 3.2 Wizard de alojamiento

En `/host/alojamiento/page.tsx`:

- Define 19 pasos (`STEPS`) y límites de progreso visual.
- Inicializa estado desde `host-draft-accommodation` (localStorage), con defaults para huéspedes/camas/baños.
- Aplica reglas de avance por paso (`canGoNext`), por ejemplo:
  - fotos requiere al menos 5,
  - título/descripcion no vacíos,
  - datos finales completos.

Al finalizar:

- Persiste borrador en localStorage.
- Construye request de creación con fallback de datos (`title`, `description`, `city`, etc.).
- Envía a `propertiesApi.create(...)`.
- Maneja error de forma silenciosa (no bloqueante) y redirige siempre a listado.

### 3.3 API frontend → backend

- `propertiesApi.create` hace `POST /dashboard/properties`.
- Este endpoint está protegido por `SupabaseAuthGuard`, `OrganizationGuard` y `SubscriptionGuard`.

Implicaciones:

- Debe existir token válido.
- Usuario no-super-admin debe pertenecer a organización.
- La organización debe tener suscripción activa.

### 3.4 Backend (módulo properties)

- `PropertiesController.create` delega en `PropertiesService.create`.
- El servicio ejecuta `CreatePropertyUseCase` con `hostId` y `organizationId` del usuario autenticado.
- El caso de uso normaliza `amenities/images` y delega al repositorio.
- Repositorio Prisma:
  - crea `property` en estado `DRAFT`,
  - serializa amenities/images en JSON,
  - además crea relaciones en `propertyAmenity` y `propertyImage` (ordenadas, primera como primaria).

## 4) Hallazgos importantes (riesgos/gaps)

1. **Pérdida de información del wizard**: varios campos capturados no se envían en el DTO final (`reservationPreference`, `discounts`, flags de seguridad, etc.).
2. **Carga de fotos desconectada del backend**: se exige mínimo 5 fotos en UI, pero el estado arranca vacío y no hay integración explícita de upload aquí (depende de `PhotosStep`).
3. **Manejo silencioso de error**: si falla `create`, sólo guarda borrador y redirige; no hay feedback inmediato al host.
4. **Coherencia parcial de tipos**: `propertyTypeId` del wizard se envía como `propertyType` string libre; podría requerir mapeo/catálogo backend para consistencia.
5. **Creación en DRAFT**: es correcto para moderación, pero implica que el usuario no verá el anuncio público hasta publicar.

## 5) Recomendaciones concretas

1. Mostrar toast/error explícito si `POST /dashboard/properties` falla y ofrecer reintento.
2. Persistir también `photoUrls` dentro del borrador para recuperación real del flujo.
3. Extender DTO/backend para incluir campos del wizard o eliminar pasos que hoy no impactan el modelo.
4. Validar y normalizar `propertyType` contra catálogo backend (id canónico, no texto libre).
5. Agregar trazabilidad (analytics/events) por paso para detectar dónde abandonan los hosts.

