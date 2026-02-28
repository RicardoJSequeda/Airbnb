# Diagnóstico y refactorización del backend — Modular Monolith con dominio fuerte

**Objetivo:** Evaluar la separación dominio / aplicación / infraestructura y proponer una refactorización progresiva hacia una arquitectura tipo Modular Monolith inspirada en DDD/Hexagonal, sin microservicios ni reescritura total.

---

## 1. Dónde está la lógica de negocio real

### 1.1 Reservas (bookings)

| Lógica de negocio | Ubicación actual | ¿En dominio puro? |
|-------------------|------------------|-------------------|
| Validación fechas (check-in &lt; now, check-out &gt; check-in) | `bookings/domain/booking.domain.ts` → `validateBookingDates` | Sí |
| Cálculo de noches | `booking.domain.ts` → `calculateNights` | Sí |
| Reglas de transición (cancelar, confirmar, rechazar) | `booking.domain.ts` → `canCancel`, `canConfirm`, `canReject` | Sí |
| **Cálculo totalPrice** (precio × noches) | `bookings.service.ts` líneas 95-96: `Number(property.price) * nights` | **No** — en servicio |
| **Disponibilidad** (conflictos de fechas, holds) | `bookings.service.ts` dentro de `$transaction` (Prisma) + Redis (lock/hold) | **No** — acoplado a Prisma/Redis |
| Límite de huéspedes vs maxGuests | `bookings.service.ts` líneas 89-93 | **No** — en servicio |
| Rate limit y lock por slot | `bookings.service.ts` — Redis | Infra en servicio |
| Crear PaymentIntent, capturar, cancelar | `bookings.service.ts` + `StripeService` | Infra en servicio |

### 1.2 Comisión de plataforma

| Lógica | Ubicación | ¿En dominio puro? |
|--------|-----------|-------------------|
| Cálculo platformFee y hostNet | `common/commission.utils.ts` → `calculatePlatformFee` | **No** — usa `Prisma.Decimal` |
| Uso del cálculo | `bookings.service.ts` (confirm), `payments.service.ts` (confirmPayment, handlePaymentSuccess) | Servicios acoplados a Config + Prisma |

### 1.3 Pagos (payments)

| Lógica | Ubicación | ¿En dominio puro? |
|--------|-----------|-------------------|
| “Solo reserva confirmada para pagar” | `payments.service.ts` línea 50 | En servicio |
| “Solo pagos COMPLETED para reembolso” | `payments.service.ts` líneas 284-286 | En servicio |
| “Solo host puede reembolsar” | `payments.service.ts` líneas 281-283 | En servicio (autorización) |
| Idempotencia webhook / confirm | `payments.service.ts` (updateMany condicional, platformFeeAmount) | En servicio + Prisma |
| Cálculo comisión en webhook | `payments.service.ts` handlePaymentSuccess — llama `calculatePlatformFee` | En servicio + Prisma.Decimal |

### 1.4 Reseñas (reviews)

| Lógica | Ubicación | ¿En dominio puro? |
|--------|-----------|-------------------|
| “Solo reservas COMPLETED” para reseñar | `reviews.service.ts` línea 49 | En servicio |
| “Una reseña por reserva” | `reviews.service.ts` líneas 53-55 | En servicio |
| “Solo después del checkOut” | `reviews.service.ts` líneas 59-61 | En servicio |
| Cálculo averageRating y ratingBreakdown | `reviews.service.ts` (reduce, calculateRatingBreakdown) | En servicio, lógica matemática acoplada a Prisma |

### 1.5 Propiedades y experiencias

- **Precio:** solo persistencia (campo en DTO/Prisma). No hay reglas de dominio (mínimo, máximo, descuentos).
- **Disponibilidad:** no existe servicio de “disponibilidad” reutilizable; la lógica de solapamiento está solo en `BookingsService` con Prisma.
- **Publicación:** transición DRAFT → PUBLISHED en servicio, sin entidad ni reglas en dominio.

---

## 2. Dependencias directas del “dominio” y servicios

### 2.1 Prisma

- **bookings.service.ts:** `PrismaService` inyectado; usa `prisma.property.findFirst`, `prisma.$transaction`, `prisma.booking.*`, `prisma.payment.*`. El servicio conoce el modelo de datos y las transacciones.
- **payments.service.ts:** idem; lee Booking, Payment; actualiza Payment y Booking en webhook/confirm/refund.
- **reviews.service.ts:** lee Booking (status, checkOut, review); crea/actualiza/elimina Review.
- **properties.service.ts / experiences.service.ts:** CRUD directo con Prisma + Redis (cache).
- **auth.service.ts:** User, Organization vía Prisma.
- **favorites.service.ts / locations.service.ts:** solo Prisma.
- **commission.utils.ts:** **depende de `Prisma.Decimal`** — no es dominio puro.

### 2.2 Redis

- **bookings.service.ts:** rate limit, lock por slot, hold por reserva (claves `booking:ratelimit:*`, `booking:lock:*`, `booking:hold:*`). Lógica de concurrencia mezclada con caso de uso.
- **payments.service.ts:** borrado de hold tras confirm (`holdKey(bookingId)`).
- **properties.service.ts / experiences.service.ts:** cache de listados (key/value). No es dominio, pero el servicio conoce Redis.

### 2.3 Stripe

- **bookings.service.ts:** crea/cancela PaymentIntent; captura en confirm. Orquestación de pago en el mismo servicio que reglas de reserva.
- **payments.service.ts:** createPaymentIntent, retrieve, capture (implícito vía webhook), createRefund, constructWebhookEvent. Todo el flujo de pago y webhooks acoplado a Stripe.
- **stripe.service.ts:** envoltura directa del SDK de Stripe (infraestructura pura).

### 2.4 HTTP / Controllers

- Los **controllers** solo reciben DTOs y llaman a servicios. No hay lógica de negocio en controllers.
- Las excepciones **NestJS** (`NotFoundException`, `BadRequestException`, etc.) se lanzan desde los **servicios**. El dominio no lanza estas excepciones; las funciones de dominio devuelven errores (ej. `BookingDateValidationError`) y el servicio las traduce a HTTP. Esto está bien para no acoplar dominio a HTTP, pero el resto del flujo sí está acoplado a infra (Prisma/Redis/Stripe) dentro del mismo servicio.

---

## 3. “God Services” y responsabilidades

### 3.1 BookingsService (~478 líneas)

**Responsabilidades mezcladas:**

1. Validación de entrada (fechas → ya delegada en parte al dominio).
2. Rate limiting y locks (Redis).
3. Comprobación de propiedad (publicada, maxGuests) — podría ser dominio o puerto.
4. Cálculo de totalPrice (debería ser dominio).
5. Creación de PaymentIntent (Stripe) — debería ser puerto PaymentGateway.
6. Transacción: comprobar disponibilidad (conflictos con otras reservas + holds) — debería ser puerto Availability/BookingRepository.
7. Crear Booking y Payment en DB (Prisma).
8. Gestionar holds en Redis.
9. cancel/confirm/reject: autorización, reglas de transición (dominio), Stripe, actualización Payment/Booking, Redis.

**Conclusión:** Es el servicio más “Dios”: orquestación + reglas + infra (Prisma, Redis, Stripe) en un solo lugar. Impide escalar a un módulo de reservas desacoplado.

### 3.2 PaymentsService (~420 líneas)

**Responsabilidades:**

1. createPaymentIntent: validar booking y usuario, llamar Stripe, upsert Payment (Prisma).
2. confirmPayment: validar estado Stripe, calcular comisión (`calculatePlatformFee`), transacción atómica (Payment + Booking), Redis hold.
3. getPaymentByBooking: autorización y lectura (Prisma).
4. refundPayment: autorización, regla “solo COMPLETED”, Stripe refund, actualizar Payment y Booking (Prisma).
5. handleWebhook + handlePaymentSuccess/Failed/Refund: duplicación de lógica de transición de estado y comisión respecto a confirm.

**Conclusión:** God Service en pagos: reglas de negocio (qué se puede pagar/reembolsar), cálculo de comisión y persistencia/Stripe/Redis en el mismo tipo. Duplicación de lógica con BookingsService (comisión, transición CONFIRMED).

### 3.3 ReviewsService, PropertiesService, ExperiencesService

- **ReviewsService:** reglas “solo COMPLETED”, “una reseña”, “después de checkOut” y lógica matemática (promedio, breakdown) dentro del servicio con Prisma. Servicio “mediano” pero sin dominio explícito.
- **PropertiesService / ExperiencesService:** CRUD + cache + formato público (averageRating, totalReviews). Lógica de presentación (cálculo de rating) dentro del servicio. No son “Dios” pero tampoco tienen capa de dominio.

### 3.4 Lógica matemática / reglas dentro de servicios acoplados

- **totalPrice = price × nights:** en `bookings.service.ts` (Prisma + número).
- **platformFee / hostNet:** en `commission.utils.ts` (Prisma.Decimal); usada en BookingsService y PaymentsService.
- **averageRating, ratingBreakdown:** en `reviews.service.ts` y en `properties.service.ts` / `experiences.service.ts` (formatPropertyForPublic, formatExperienceForPublic) — reducciones y redondeos en el mismo archivo que Prisma.

---

## 4. Diagnóstico global

### 4.1 ¿Qué tan desacoplado está el dominio?

- **Parcial solo en bookings:** existe `bookings/domain/booking.domain.ts` con validación de fechas, cálculo de noches, estados y transiciones, e interfaz `IBookingsReadRepository`. El resto del backend no tiene capa de dominio explícita.
- **Comisión:** depende de Prisma.Decimal; no es portable.
- **Precio total, disponibilidad, reglas de reseña y pagos:** están en servicios que usan Prisma, Redis o Stripe directamente. Si cambias de ORM o de proveedor de pago, hay que tocar esos servicios por completo.

**Veredicto:** El dominio está **poco desacoplado**. Solo un pequeño núcleo de reservas es independiente del framework; el resto es “servicios con lógica” acoplados a infraestructura.

### 4.2 ¿Qué módulos están mejor diseñados?

- **Bookings:** mejor que el resto: tiene dominio (validaciones, noches, transiciones), un puerto de lectura (`IBookingsReadRepository`) y una implementación en infra (`PrismaBookingsReadRepository`). Sigue teniendo la mayor parte de la orquestación y la infra (Prisma/Redis/Stripe) en el mismo servicio.
- **Locations:** solo lectura y mapeo; bajo riesgo, sin reglas de negocio complejas.
- **Favorites:** CRUD simple; sin dominio explícito pero acotado.
- **Auth:** delegación a JWT/bcrypt/Supabase; lógica de negocio limitada (email único, rol). Aceptable para un módulo de identidad.

Los **peor diseñados** en términos dominio/infra: **BookingsService** (por concentrar demasiado), **PaymentsService** (reglas + Stripe + Prisma + Redis) y **ReviewsService** (reglas de reseña + cálculos en el mismo servicio que Prisma).

### 4.3 ¿Qué partes impedirían escalar a microservicios?

- **Bookings + Payments:** lógica de reserva y pago repartida entre BookingsService y PaymentsService, ambos con Prisma y Stripe. No hay un “módulo de reservas” con puertos claros (BookingRepository, PaymentGateway, AvailabilityStore). Para extraer un “Booking Service” habría que desacoplar primero.
- **Comisión:** usada en BookingsService (confirm) y PaymentsService (confirm + webhook). Está en un util compartido que depende de Prisma.Decimal. Sin dominio de “pagos/comisión”, cualquier servicio futuro que calcule comisión seguiría acoplado.
- **Disponibilidad:** solo existe como consultas Prisma + Redis dentro de BookingsService. No hay interfaz “AvailabilityRepository” ni “ConflictCheck”. Un microservicio de disponibilidad requeriría extraer esa responsabilidad y definir contratos.
- **Reviews:** dependen de Booking (status, checkOut) vía Prisma. Sin puerto “BookingRead” o evento “BookingCompleted”, el desacoplamiento sería costoso.

### 4.4 ¿Dónde se rompería el sistema si cambiamos Prisma o Stripe?

- **Cambio de Prisma (ej. a TypeORM o SQL directo):**  
  Todos los servicios que usan `PrismaService` (bookings, payments, properties, experiences, reviews, favorites, auth, locations, health). Los que más sufren: BookingsService (transacciones, includes), PaymentsService (updateMany condicional, relaciones), ReviewsService (includes Booking/Property). Además, `commission.utils.ts` usa `Prisma.Decimal`; habría que reemplazar por otro tipo decimal en todo el código que lo use.

- **Cambio de Stripe (ej. a otro PSP):**  
  BookingsService (createPaymentIntent, cancelPaymentIntent, capturePaymentIntent) y PaymentsService (createPaymentIntent, retrieve, refund, webhooks). StripeService es el único punto de llamada a Stripe, pero la **semántica** (intent, capture, refund) está embebida en los casos de uso. Sin un puerto `PaymentGateway` (createIntent, capture, cancel, refund) y DTOs de dominio, cambiar de proveedor implica tocar ambos servicios y los flujos completos.

---

## 5. Problemas críticos (resumen)

1. **Cálculo de totalPrice y comisión** fuera del dominio y, en el caso de la comisión, atado a `Prisma.Decimal`.
2. **Disponibilidad** (conflictos + holds) solo dentro de BookingsService con Prisma y Redis; no hay abstracción.
3. **BookingsService** y **PaymentsService** concentran orquestación, reglas e infra; son los principales candidatos a dividir en “dominio + aplicación + puertos”.
4. **Duplicación** de lógica de comisión y transición PENDING→COMPLETED entre confirm en BookingsService y confirmPayment/webhook en PaymentsService.
5. **Reviews** y **rating** (averageRating, breakdown) con lógica matemática en servicios acoplados a Prisma.
6. Sin **entidades ricas** (ej. Booking como agregado con comportamiento); todo son DTOs y modelos Prisma.

---

## 6. Ejemplo concreto: cómo debería verse el nuevo Booking domain

Objetivo: dominio de reservas **sin** importar Prisma, Redis, Stripe ni NestJS. Solo tipos, funciones y contratos (puertos).

### 6.1 Estructura objetivo (después de las 4 fases)

```
apps/api-gateway/src/bookings/
├── domain/
│   ├── booking.domain.ts      # validaciones, noches, estados, transiciones (ya existe, ampliado)
│   ├── booking-pricing.domain.ts   # NUEVO: totalPrice, comisión con number/decimal genérico
│   ├── booking.entity.ts      # NUEVO (Fase 2): entidad Booking con comportamiento
│   └── ports.ts               # NUEVO (Fase 3): interfaces IPaymentGateway, IBookingRepository, IAvailabilityStore
├── application/
│   └── create-booking.command.ts   # NUEVO (Fase 4): orquestación que usa dominio + puertos
├── infra/
│   ├── prisma-bookings-read.repository.ts   # ya existe
│   ├── prisma-booking.repository.ts         # NUEVO: implementa IBookingRepository (escritura)
│   ├── stripe-payment.gateway.ts            # NUEVO: implementa IPaymentGateway
│   └── redis-availability.store.ts          # NUEVO (opcional): implementa IAvailabilityStore para locks/holds
├── bookings.controller.ts
├── bookings.module.ts
└── bookings.service.ts   # Fase 4: delega a application/create-booking y otros commands
```

### 6.2 Contenido ejemplo: dominio puro (Fase 1 + 2)

**booking-pricing.domain.ts (Fase 1 — sin Prisma)**

```ts
/**
 * Cálculos de precio y comisión. Sin dependencias de Prisma.
 * Para precisión decimal se usa number con redondeo a 2 decimales;
 * opcionalmente se puede usar una lib decimal genérica (decimal.js) más adelante.
 */

export function calculateBookingTotal(pricePerNight: number, nights: number): number {
  const total = pricePerNight * nights;
  return Math.round(total * 100) / 100;
}

export function calculatePlatformFee(
  totalAmount: number,
  feePercentage: number,
): { platformFee: number; hostNet: number } {
  const pct = feePercentage / 100;
  const platformFee = Math.round(totalAmount * pct * 100) / 100;
  const hostNet = Math.round((totalAmount - platformFee) * 100) / 100;
  return { platformFee, hostNet };
}
```

**booking.entity.ts (Fase 2 — entidad rica, opcional)**

```ts
import {
  validateBookingDates,
  BookingDateValidationError,
  calculateNights,
  canCancel,
  canConfirm,
  canReject,
  BookingStatus,
} from './booking.domain';
import { calculateBookingTotal } from './booking-pricing.domain';

export type BookingProps = {
  id: string;
  propertyId: string;
  guestId: string;
  organizationId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: string;
  maxGuestsAllowed: number;
  pricePerNight: number;
};

export class Booking {
  constructor(private readonly props: BookingProps) {}

  get id() { return this.props.id; }
  get status() { return this.props.status; }
  get totalPrice() { return this.props.totalPrice; }
  get checkIn() { return this.props.checkIn; }
  get checkOut() { return this.props.checkOut; }

  static create(params: {
    propertyId: string;
    guestId: string;
    organizationId: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    maxGuestsAllowed: number;
    pricePerNight: number;
  }): { error?: BookingDateValidationError; booking?: Booking } {
    const dateError = validateBookingDates(params.checkIn, params.checkOut);
    if (dateError) return { error: dateError };
    if (params.guests > params.maxGuestsAllowed) {
      return { error: 'TOO_MANY_GUESTS' as any };
    }
    const nights = calculateNights(params.checkIn, params.checkOut);
    const totalPrice = calculateBookingTotal(params.pricePerNight, nights);
    return {
      booking: new Booking({
        id: '', // lo asigna el repo
        ...params,
        totalPrice,
        status: BookingStatus.PENDING,
      }),
    };
  }

  canCancel(): boolean { return canCancel(this.props.status); }
  canConfirm(): boolean { return canConfirm(this.props.status); }
  canReject(): boolean { return canReject(this.props.status); }
}
```

### 6.3 Puertos (Fase 3)

**domain/ports.ts**

```ts
export interface IPaymentGateway {
  createIntent(amount: number, currency: string, metadata: Record<string, string>, captureManual: boolean): Promise<{ id: string; clientSecret: string }>;
  cancelIntent(paymentIntentId: string): Promise<void>;
  captureIntent(paymentIntentId: string): Promise<void>;
  retrieveIntent(paymentIntentId: string): Promise<{ status: string }>;
}

export interface IBookingRepository {
  save(booking: { propertyId: string; guestId: string; organizationId: string; checkIn: Date; checkOut: Date; guests: number; totalPrice: number; status: string }): Promise<{ id: string }>;
  findById(id: string, organizationId?: string | null): Promise<BookingSnapshot | null>;
  updateStatus(id: string, status: string): Promise<void>;
  hasConflictingBooking(propertyId: string, checkIn: Date, checkOut: Date, excludeBookingId?: string): Promise<boolean>;
  hasConflictingPendingWithHold(propertyId: string, checkIn: Date, checkOut: Date, holdChecker: (bookingId: string) => Promise<boolean>): Promise<boolean>;
}

export interface IAvailabilityStore {
  tryAcquireLock(propertyId: string, checkIn: string, checkOut: string, ttlSeconds: number): Promise<boolean>;
  releaseLock(propertyId: string, checkIn: string, checkOut: string): Promise<void>;
  setHold(bookingId: string, guestId: string, ttlSeconds: number): Promise<void>;
  deleteHold(bookingId: string): Promise<void>;
  checkHold(bookingId: string): Promise<boolean>;
}

export type BookingSnapshot = { id: string; status: string; guestId: string; propertyId: string; totalPrice: number; /* ... */ };
```

El **BookingsService** actual se convertiría en un **Application Service** que: recibe DTO, valida con dominio (o entidad), llama a `IBookingRepository.hasConflictingBooking` / `IAvailabilityStore.tryAcquireLock`, usa `IPaymentGateway.createIntent`, luego `IBookingRepository.save` y `IAvailabilityStore.setHold`, sin conocer Prisma ni Stripe directamente.

---

## 7. Plan de refactorización incremental en 4 fases

### Fase 1: Cálculos puros en dominio (sin nuevas entidades)

**Objetivo:** Mover totalPrice, comisión, noches y validaciones a dominio puro sin dependencias externas.

| Paso | Archivo(s) | Acción |
|-----|------------|--------|
| 1.1 | `apps/api-gateway/src/bookings/domain/booking-pricing.domain.ts` | **Crear.** `calculateBookingTotal(pricePerNight, nights)` y `calculatePlatformFee(totalAmount, feePercentage)` usando solo `number` y redondeo a 2 decimales. |
| 1.2 | `apps/api-gateway/src/common/commission.utils.ts` | Mantener como **wrapper** que convierte number/Decimal a number y llama a la función de dominio (o deprecar y usar solo dominio desde servicios). |
| 1.3 | `apps/api-gateway/src/bookings/bookings.service.ts` | En `create`: reemplazar `const totalPrice = Number(property.price) * nights` por `calculateBookingTotal(Number(property.price), nights)` importado del dominio. |
| 1.4 | `apps/api-gateway/src/bookings/bookings.service.ts` | En `confirm`: obtener feePercentage del config; llamar a `calculatePlatformFee(totalAmount, feePercentage)` del dominio; convertir resultado a Prisma.Decimal solo en el momento del `payment.update` (adaptador en el servicio). |
| 1.5 | `apps/api-gateway/src/payments/payments.service.ts` | En `confirmPayment` y `handlePaymentSuccess`: usar `calculatePlatformFee` del dominio (booking-pricing.domain.ts); en el update a Prisma, mapear number → Decimal si hace falta. |
| 1.6 | Tests | Añadir tests unitarios para `booking.domain.ts` y `booking-pricing.domain.ts` (sin Prisma/Redis/Stripe). |

**Criterio de éxito:** Ningún cálculo de totalPrice o comisión en servicios sin pasar por dominio; dominio sin importar Prisma.

---

### Fase 2: Entidades o agregados (Booking como entidad rica)

**Objetivo:** Introducir una entidad Booking (o agregado) que encapsule estado y reglas de transición.

| Paso | Archivo(s) | Acción |
|-----|------------|--------|
| 2.1 | `apps/api-gateway/src/bookings/domain/booking.entity.ts` | **Crear** (opcional). Clase Booking con props, getters, y métodos estáticos/instancia que usen `validateBookingDates`, `calculateNights`, `calculateBookingTotal`, `canCancel`, `canConfirm`, `canReject`. Sin Prisma. |
| 2.2 | `bookings.service.ts` | En create: construir datos para Booking.create(); si hay error de validación, mapear a BadRequestException. En cancel/confirm/reject: cargar datos de reserva, instanciar Booking (o usar solo funciones de dominio), comprobar canCancel/canConfirm/canReject antes de llamar a Stripe/Prisma. |
| 2.3 | Decisión | Si se considera overkill para el equipo, Fase 2 puede limitarse a “usar solo funciones de dominio” sin clase Booking; las fases 3 y 4 siguen siendo válidas. |

**Criterio de éxito:** Reglas de reserva centralizadas en dominio (o en entidad); servicio solo orquesta y traduce excepciones.

---

### Fase 3: Puertos para infraestructura

**Objetivo:** Definir interfaces (puertos) para pago, persistencia de reservas y disponibilidad; implementaciones en infra.

| Paso | Archivo(s) | Acción |
|-----|------------|--------|
| 3.1 | `apps/api-gateway/src/bookings/domain/ports.ts` | **Crear.** Interfaces: `IPaymentGateway` (createIntent, cancelIntent, captureIntent, retrieveIntent), `IBookingRepository` (save, findById, updateStatus, hasConflictingBooking, hasConflictingPendingWithHold), opcionalmente `IAvailabilityStore` (tryAcquireLock, setHold, deleteHold, checkHold). |
| 3.2 | `apps/api-gateway/src/bookings/infra/stripe-payment.gateway.ts` | **Crear.** Clase que implementa `IPaymentGateway` inyectando StripeService (o Stripe directamente). Mapea parámetros de dominio a Stripe. |
| 3.3 | `apps/api-gateway/src/bookings/infra/prisma-booking.repository.ts` | **Crear.** Implementa `IBookingRepository`: save (create Booking + Payment en transacción si aplica), findById, updateStatus, hasConflictingBooking (query Prisma), hasConflictingPendingWithHold (query + callback para hold). |
| 3.4 | `apps/api-gateway/src/bookings/infra/redis-availability.store.ts` | **Crear** (opcional). Implementa `IAvailabilityStore` usando RedisService. |
| 3.5 | `bookings.module.ts` | Registrar implementaciones: `{ provide: 'IPaymentGateway', useClass: StripePaymentGateway }`, etc. |
| 3.6 | `bookings.service.ts` | Inyectar `IPaymentGateway`, `IBookingRepository`, `IAvailabilityStore` (por token de inyección). Sustituir llamadas directas a Prisma/Stripe/Redis por llamadas a los puertos. Mantener adaptación de resultados (ej. Prisma → DTO) en el servicio o en un mapper. |

**Criterio de éxito:** BookingsService no importa Prisma ni Stripe; solo usa interfaces y recibe implementaciones por DI.

---

### Fase 4: BookingsService como Application Service

**Objetivo:** Reducir BookingsService a orquestación: validar entrada, llamar dominio y puertos, mapear resultados y excepciones.

| Paso | Archivo(s) | Acción |
|-----|------------|--------|
| 4.1 | `apps/api-gateway/src/bookings/application/create-booking.command.ts` | **Crear** (opcional). Clase o función `CreateBookingCommand` que recibe (dto, guestId, organizationId), usa dominio + IBookingRepository + IPaymentGateway + IAvailabilityStore, y devuelve resultado o lanza errores de dominio. Sin NestJS exceptions; el controller o el servicio las traducen. |
| 4.2 | `bookings.service.ts` | Delegar `create` a CreateBookingCommand (o mantener la lógica en el servicio pero usando solo puertos y dominio). Métodos `cancel`, `confirm`, `reject` igual: solo orquestación + puertos + dominio. |
| 4.3 | Controllers | Sin cambios necesarios; siguen llamando a BookingsService. |
| 4.4 | Pagos | En PaymentsService, de forma análoga (fase posterior): introducir puerto IPaymentGateway si no se usa ya desde bookings; extraer “confirmación de pago” a un caso de uso que use dominio (comisión) y repositorio de pago. |

**Criterio de éxito:** BookingsService es delgado, sin lógica de negocio más allá de “llamar al dominio y a los puertos”; fácil de testear con mocks de puertos.

---

## 8. Orden sugerido y compatibilidad

- Las fases son **incrementalmente compatibles** con el código actual: se pueden hacer en el orden 1 → 2 → 3 → 4.
- **Fase 1** tiene el mayor impacto inmediato (cálculos y comisión en dominio) con poco riesgo.
- **Fase 3** permite sustituir Prisma/Stripe/Redis detrás de los puertos sin tocar la orquestación.
- No se propone reescritura total ni microservicios; el monolito sigue siendo uno, con módulos más claros y dominio más fuerte.

Si quieres, el siguiente paso puede ser implementar solo la **Fase 1** (archivos concretos y parches) en el repo actual.
