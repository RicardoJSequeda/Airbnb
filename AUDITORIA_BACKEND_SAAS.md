# Auditoría técnica del backend – SaaS en Vercel

**Fecha:** 16 de febrero de 2025  
**Objetivo:** Evaluar si el sistema está listo para producción SaaS en Vercel

---

## 1. MULTI-TENANT

### 1.1 Filtrado por `organizationId`

| Servicio | Método | Filtra por org | Notas |
|----------|--------|----------------|-------|
| Properties | findAll, findOne, update, remove, publish | ✅ Sí | `organizationId` desde `req.user` |
| Bookings | create, findAllByGuest, findAllByHost, findOne, cancel, confirm, reject | ✅ Sí | `organizationId` desde `req.user` |
| Payments | getPaymentByBooking, refundPayment | ✅ Sí | `organizationId` opcional para SUPER_ADMIN |
| Payments | createPaymentIntent, confirmPayment | ⚠️ Parcial | Solo valida `guestId`; no filtra por org explícitamente |
| Reviews | create, findByProperty, findByUser, findOne, update, remove | ✅ Sí | `organizationId` opcional |
| Favorites | addFavorite, removeFavorite, toggleFavorite, getFavorites | ✅ Sí | `organizationId` opcional |

**Hallazgo:** `createPaymentIntent` y `confirmPayment` no filtran booking/payment por `organizationId`. La validación se basa solo en `guestId === userId`. En el flujo actual (reserva siempre en la misma org del usuario), es seguro, pero falta defensa en profundidad.

### 1.2 Endpoints privados sin `OrganizationGuard`

| Controlador | Ruta | Guard actual | Estado |
|-------------|------|--------------|--------|
| Auth | POST /register, POST /login | @Public | ✅ Correcto |
| Auth | GET /me | SupabaseAuthGuard + OrganizationGuard | ✅ |
| Properties (dashboard) | Todas | SupabaseAuthGuard + OrganizationGuard + SubscriptionGuard | ✅ |
| Bookings | Todas | SupabaseAuthGuard + OrganizationGuard + SubscriptionGuard | ✅ |
| Payments | create-intent, confirm, booking/:id, refund | SupabaseAuthGuard + OrganizationGuard + SubscriptionGuard | ✅ |
| Payments | webhook | @Public | ✅ Excluido correctamente |
| Reviews | Todas | SupabaseAuthGuard + OrganizationGuard + SubscriptionGuard | ✅ |
| Favorites | Todas | SupabaseAuthGuard + OrganizationGuard + SubscriptionGuard | ✅ |
| PublicProperties | Todas | @Public | ✅ |

No se encontraron endpoints privados sin `OrganizationGuard`.

### 1.3 Acceso por `organizationSlug` o query params

- No existe ningún endpoint que filtre por `organizationSlug`.
- `organizationId` no se acepta desde query params; siempre proviene de `req.user`.
- El único uso de `slug` es interno: `auth.service` y `supabase-jwt.strategy` para la org `demo` en registro/auto-creación. No expuesto en APIs públicas.

### 1.4 Acceso de SUPER_ADMIN

- `OrganizationGuard`: si `user.role === SUPER_ADMIN` → permite (sin exigir `organizationId`).
- `SubscriptionGuard`: si `user.role === SUPER_ADMIN` → permite (sin validar suscripción).
- En servicios: cuando `organizationId` es `null`, las consultas no añaden filtro por org (acceso global explícito).
- El decorador `SkipOrganizationCheck` existe pero no se usa; permite extensibilidad futura.

---

## 2. SUSCRIPCIÓN

### 2.1 `SubscriptionGuard` en controladores SaaS privados

| Controlador | Rutas | SubscriptionGuard |
|-------------|-------|-------------------|
| PropertiesController (dashboard) | Todas | ✅ Sí |
| BookingsController | Todas | ✅ Sí |
| PaymentsController | create-intent, confirm, getByBooking, refund | ✅ Sí |
| ReviewsController | Todas | ✅ Sí |
| FavoritesController | Todas | ✅ Sí |

### 2.2 Webhooks excluidos

- `POST /api/payments/webhook` está decorado con `@Public()`.
- `SubscriptionGuard` permite explícitamente rutas `@Public()`.
- El webhook no pasa por `SubscriptionGuard` ni por otros guards de negocio.

### 2.3 Rutas privadas sin validación de suscripción

- `GET /api/auth/me` usa `OrganizationGuard` pero **no** `SubscriptionGuard`.
- Permite que usuarios con suscripción CANCELED/PAST_DUE vean su perfil (probablemente intencional para CTA de upgrade).
- Ninguna otra ruta privada SaaS carece de `SubscriptionGuard`.

---

## 3. PAGOS

### 3.1 Idempotencia del cálculo de comisión

| Flujo | Idempotencia |
|-------|--------------|
| `confirmPayment` | ✅ Si `status === COMPLETED`, devuelve breakdown existente sin recalcular. |
| `handlePaymentSuccess` (webhook) | ✅ Si `status === COMPLETED` o `platformFeeAmount != null`, no recalcula. |

### 3.2 Transición PENDING → COMPLETED transaccional

- `confirmPayment`: usa dos `prisma.update()` separados (Payment y Booking) **sin** `$transaction`.
- `handlePaymentSuccess`: mismo patrón, sin transacción.
- Riesgo: actualización parcial si falla entre ambos updates.
- Riesgo: race entre `confirmPayment` y webhook sobre el mismo pago.

### 3.3 Doble captura

- `createPaymentIntent`: comprueba `existingPayment.status === COMPLETED` y rechaza.
- `confirmPayment`: idempotente (devuelve datos si ya COMPLETED).
- Webhook: idempotente (retorna si ya procesado).
- No se detecta lógica de doble captura.

### 3.4 Índices en Payment

```prisma
@@index([bookingId])   // bookingId tiene @unique → índice implícito
@@index([organizationId])
```

- `stripePaymentIntentId`: tiene `@unique` → índice implícito.
- No existe índice explícito sobre `(status, bookingId)`. Para los patrones de uso actuales (búsqueda por `bookingId` o `stripePaymentIntentId`) los índices son suficientes.

---

## 4. SEGURIDAD

### 4.1 Exposición de `organizationId` en endpoints públicos

- `GET /public/properties` y `GET /public/properties/:id` usan `formatPropertyForPublic`, que **excluye** `organizationId`.
- Auth `/me` devuelve `organizationId` de la propia organización del usuario autenticado (endpoint privado).
- Los endpoints de dashboard (properties, bookings, etc.) devuelven datos ya filtrados por org; exponer `organizationId` es coherente con el multi-tenant.

### 4.2 DTOs y sobrescritura de `organizationId`

- Ningún DTO incluye `organizationId`, `hostId` ni campos sensibles similares.
- `ValidationPipe` con `whitelist: true` y `forbidNonWhitelisted: true` impide campos extra en el body.
- Servicios asignan `organizationId` y `hostId` desde `req.user`, no desde el cliente.

### 4.3 Mass assignment

- DTOs restringidos mediante class-validator.
- Servicios construyen el `data` explícitamente (ej. `createProperty` usa `hostId`, `organizationId` inyectados).
- No se usa `{ ...dto }` sin control para persistir en BD.

---

## 5. PERFORMANCE

### 5.1 Consultas N+1

- No se detectan bucles que realicen queries individuales dentro de un `for`.
- `bookings.service` itera sobre `conflictingPending` solo para chequear holds en Redis (sin queries a BD por iteración).
- Uso de `include` y `select` para cargar relaciones en una sola query.

### 5.2 Uso de índices

- `Property`: `hostId`, `organizationId`, `(city, country)`, `propertyType`.
- `Booking`: `propertyId`, `guestId`, `organizationId`, `status`, `(propertyId, checkIn, checkOut)`, `(checkIn, checkOut)`.
- `Payment`: `bookingId`, `organizationId`.
- `Subscription`: `organizationId`.
- Los índices cubren los filtros y joins habituales.

### 5.3 `SubscriptionGuard` y caché

- Se ejecuta en **cada** request protegido (dashboard, bookings, payments, reviews, favorites).
- Realiza `subscription.findFirst` por petición.
- No hay caché por org; se recomienda añadir caché de corta duración (ej. Redis, TTL ~60s) para reducir carga en BD.

---

## 6. ESTADO DE PRODUCCIÓN

### 6.1 Webhook de Stripe y raw body

- `main.ts`: `rawBody: true` configurado en `NestFactory.create`.
- Webhook: valida `req.rawBody` y lanza excepción si falta.
- Cuerpo raw se usa para verificación de firma de Stripe.

### 6.2 Variables críticas en env

| Variable | Uso | Crítico |
|---------|-----|---------|
| DATABASE_URL | Prisma | ✅ |
| DIRECT_URL | Migraciones | ✅ |
| JWT_SECRET | Auth local | ✅ |
| SUPABASE_JWT_SECRET | Auth Supabase | ✅ |
| STRIPE_SECRET_KEY | Pagos | ✅ |
| STRIPE_WEBHOOK_SECRET | Webhook | ✅ |
| PLATFORM_FEE_PERCENTAGE | Comisiones | ✅ (default 0 si falta) |
| FRONTEND_URL | CORS | ✅ |
| REDIS_URL | Cache, rate limit, holds | Opcional |
| PORT | Servidor | Opcional |
| NODE_ENV | Logging | Opcional |

### 6.3 `console.log` sensibles

- No hay `console.log` en `src`.
- Se usa `Logger` de NestJS.

---

## 7. RESUMEN EJECUTIVO

### Hallazgos críticos

1. **Transición PENDING → COMPLETED no transaccional**: `confirmPayment` y `handlePaymentSuccess` actualizan Payment y Booking en operaciones separadas. Riesgo de estado inconsistente o condiciones de carrera.
2. **`createPaymentIntent` sin filtro de org**: No se valida que el booking pertenezca a la organización del usuario. Mitigado por la validación de `guestId`, pero falta defensa en profundidad.

### Hallazgos moderados

3. **`GET /auth/me` sin `SubscriptionGuard`**: Usuarios con suscripción inactiva pueden ver su perfil. Probablemente intencional para permitir CTA de upgrade.
4. **Sin caché en `SubscriptionGuard`**: Query a BD en cada request protegido; impacto en alta concurrencia.

### Mejoras recomendadas

| Prioridad | Descripción |
|-----------|-------------|
| Alta | Envolver en `prisma.$transaction` la transición PENDING → COMPLETED en `confirmPayment` y `handlePaymentSuccess`. |
| Media | Añadir filtro por `organizationId` en `createPaymentIntent` cuando exista en el usuario. |
| Media | Implementar caché de suscripción (Redis o in-memory) para `SubscriptionGuard`. |
| Baja | Índice compuesto `(status, bookingId)` en `Payment` si se prevé reportes o consultas por estado. |
| Baja | Evaluar si `/auth/me` debe incluir `SubscriptionGuard` según la UX deseada. |

### Nivel estimado de readiness: **7.5/10**

- Multi-tenant e integración con guards bien implementados.
- Pagos con idempotencia correcta pero sin transaccionalidad en la transición crítica.
- Seguridad robusta (DTOs, ValidationPipe, endpoints públicos).
- Performance aceptable; margen de mejora en caché de suscripción.

### Riesgos antes de producción

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Race condition en PENDING → COMPLETED | Alto | Baja | Transacción atómica |
| Fuga de datos entre organizaciones (bug) | Muy alto | Muy baja | Filtros por org; revisar `createPaymentIntent` |
| Caída por carga en BD por `SubscriptionGuard` | Medio | Media | Caché de suscripción |
| Redis no configurado en Vercel | Bajo | Alta | Redis addon; flujo degradado sin caché |
| Configuración incorrecta de Stripe webhook | Alto | Media | Verificar `rawBody` y firma en staging |

---

*Auditoría realizada sobre el código del proyecto Airbnb Full Clone (api-gateway).*
