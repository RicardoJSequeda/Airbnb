# Arquitectura del monorepo

Este documento describe la estructura del proyecto y el patrón estándar para añadir o modificar código. **Usa `bookings/` como referencia canónica** cuando dudes.

---

## 1. Estructura general del monorepo

```
Airbnb/
├── apps/
│   ├── api-gateway/     # Backend NestJS (API REST, autenticación, lógica de negocio)
│   └── web/             # Frontend Next.js (App Router, React)
├── packages/
│   └── database/       # Prisma schema + cliente compartido (@airbnb-clone/database)
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

- **api-gateway**: única aplicación que habla con la base de datos vía Prisma. Expone REST y consume servicios externos (Stripe, Redis, etc.).
- **web**: no toca la BD; consume solo la API del api-gateway.
- **database**: define el schema Prisma (multi-schema) y genera el cliente; lo consumen solo el api-gateway (y opcionalmente workers).

---

## 2. Patrón estándar de un módulo (referencia: `bookings/`)

Cada **módulo de dominio** (bookings, experiences, properties, payments, etc.) sigue la misma estructura:

```
<módulo>/
├── <módulo>.module.ts       # Registro Nest: controllers, providers, exports
├── <módulo>.controller.ts   # Rutas HTTP (solo delega al Service)
├── <módulo>.service.ts      # Orquestador: delega en use cases y queries
├── dto/                     # DTOs de entrada (create, update)
├── domain/                  # Reglas de negocio y contratos (sin Prisma/HTTP)
│   ├── ports/               # Interfaces (repositorios, puertos externos)
│   ├── events/              # Eventos de dominio (opcional)
│   ├── read-models/         # Tipos de lectura CQRS (opcional)
│   └── *.ts                 # Aggregates, value objects, reglas puras
├── application/             # Casos de uso y queries
│   ├── *.usecase.ts         # Un archivo por comando (create, update, delete, …)
│   ├── queries/             # Un archivo por query (list, get, get-by-x)
│   └── errors.ts            # Errores de aplicación (NotFound, Forbidden, BadRequest)
└── infra/                   # Implementaciones concretas (Prisma, Stripe, Redis)
    └── prisma-*.repository.ts
```

### Responsabilidades por capa

| Capa | Qué va aquí | Ejemplo |
|------|-------------|---------|
| **domain/** | Reglas de negocio puras, interfaces (ports), eventos, read-models. **Sin** imports de Nest, Prisma, HTTP. | `booking.aggregate.ts`, `IBookingsRepository`, `BookingSnapshot` |
| **application/** | Orquestación: use cases (comandos) y queries (consultas). Usan solo los ports y el dominio. **Sin** Prisma ni detalles de infra. | `create-booking.usecase.ts`, `get-bookings-by-guest.query.ts` |
| **infra/** | Implementaciones de los ports: repositorios Prisma, adaptadores a Stripe/Redis, etc. Aquí sí se importa Prisma y SDKs externos. | `prisma-bookings.repository.ts`, `stripe.port.adapter.ts` |
| **Service** | Fachada para el controller: recibe la petición, llama al use case o query adecuado, mapea errores de aplicación a excepciones HTTP. | `bookings.service.ts` |
| **Controller** | Solo define rutas, valida DTOs y delega en el Service. Sin lógica de negocio. | `bookings.controller.ts` |

---

## 3. Use case vs Query

### Use case (comando)

- **Archivo**: `application/<acción>.<entidad>.usecase.ts` (ej. `create-booking.usecase.ts`, `publish-property.usecase.ts`).
- **Cuándo**: cuando la operación **cambia estado** (create, update, delete, publish, confirm, cancel, etc.).
- **Responsabilidad**: validar, aplicar reglas de dominio, llamar a repositorios/puertos, devolver un resultado tipado.
- **Patrón**: un archivo por operación; inyecta solo repositorios y puertos (no Prisma directo).

### Query

- **Archivo**: `application/queries/<nombre>.query.ts` (ej. `get-booking-details.query.ts`, `list-experiences.query.ts`).
- **Cuándo**: cuando la operación **solo lee** y opcionalmente aplica caché o filtros (list, get-by-id, get-by-guest, etc.).
- **Responsabilidad**: leer a través del repositorio (o query repository si existe), formatear y devolver datos; puede usar Redis para caché.
- **Patrón**: un archivo por consulta; inyecta repositorio (y Redis si aplica).

### Resumen

- **Comando (escribe)** → Use case en `application/`.
- **Consulta (solo lee)** → Query en `application/queries/`.

---

## 4. Reglas de dependencias (qué puede importar qué)

```
Controller → Service → Use cases / Queries
                ↓
         domain/ports (interfaces)
                ↓
         infra (implementaciones)
```

Reglas:

1. **domain/**  
   - Puede importar solo tipos/reglas de su propio dominio (y tipos compartidos si existen).  
   - **No** importa: `application/`, `infra/`, Nest, Prisma, HTTP.

2. **application/** (use cases y queries)  
   - Importa: `domain/ports`, `domain/*` (aggregates, errores), `application/errors.ts`, DTOs.  
   - **No** importa: `infra/`, Prisma, Stripe, Redis (solo las interfaces en `domain/ports`).

3. **infra/**  
   - Implementa interfaces de `domain/ports`.  
   - Puede importar: Prisma, Stripe, Redis, etc.  
   - **No** importa: `application/` (use cases/queries).

4. **Service**  
   - Importa: use cases, queries, `application/errors`, y mapea a excepciones HTTP de Nest.  
   - **No** importa: `infra/` ni `domain/` salvo si reutiliza un tipo; no contiene lógica de negocio.

5. **Controller**  
   - Importa: Service, DTOs, guards, decoradores.  
   - **No** importa: use cases, queries, repositorios ni dominio.

6. **DTOs**  
   - Viven en `dto/` o en la raíz del módulo; pueden ser usados por controller, service y use cases (solo como tipos de entrada).

---

## 5. Capa `contexts/`

### Qué es

`contexts/` es la **fachada pública** que otros módulos (por ejemplo workers o otros bounded contexts) usan para interactuar con un dominio. **No contiene lógica de negocio ni infraestructura**.

### Estructura típica

```
contexts/
├── bookings/
│   ├── bookings-context.module.ts   # Importa BookingsModule, exporta el port
│   ├── contracts/
│   │   ├── bookings-context.port.ts # Interfaz que expone el contexto
│   │   └── events/                  # Contratos de eventos (payloads, topics)
│   └── application/
│       └── bookings-context.service.ts  # Implementa el port delegando en BookingsService
├── payments/
│   └── ...
├── users/      # Agrupa Auth + Favorites (solo reexporta módulos)
└── listings/   # Agrupa Properties + Experiences + Locations + Reviews (solo reexporta)
```

### Cuándo usar un context

- **Sí**: cuando otro **módulo o proceso** (p. ej. worker, otro servicio) necesita operar sobre reservas o pagos mediante una **interfaz estable** (el port), sin depender del módulo concreto.
- **No**: para exponer HTTP; eso lo hace el **controller** del módulo de dominio (bookings, payments, etc.).

### Reglas

- El **Context Service** solo delega en el Service del módulo (ej. `BookingsService`); no tiene lógica propia.
- **No** hay infraestructura (Prisma, Redis, etc.) dentro de `contexts/`; esa vive en el módulo de dominio o en `common/`.
- Los **consumers** de eventos (Kafka, etc.) viven en `platform/messaging/consumers/` o en el módulo que corresponda, no dentro de `contexts/`.

---

## 6. Stack tecnológico por capa

| Capa / Área | Tecnología |
|-------------|------------|
| **Monorepo** | pnpm workspaces, Turborepo |
| **Backend (api-gateway)** | NestJS, TypeScript |
| **Base de datos** | PostgreSQL, Prisma (multi-schema: users, listings, bookings, payments, platform) |
| **Acceso a BD** | Un único `PrismaService` (common); ningún PrismaBookingsClient / PrismaPaymentsClient |
| **Autenticación** | JWT (sesiones en BD), Supabase Auth (social), Passport |
| **Pagos** | Stripe (PaymentIntents, manual capture) |
| **Caché / colas** | Redis, Kafka (Outbox en platform) |
| **Frontend (web)** | Next.js 16 (App Router), React 19, Tailwind, Zustand, Axios |
| **Validación** | class-validator (DTOs), Zod en frontend si aplica |

---

## 7. Dónde poner código nuevo

| Necesidad | Dónde |
|-----------|--------|
| Nueva **ruta HTTP** | Añadir método en el controller existente del módulo; el controller delega en el Service. |
| Nueva **operación que escribe** (ej. “archivar reserva”) | Nuevo use case en `application/<acción>.<entidad>.usecase.ts` y método en el Service que lo llame. |
| Nueva **consulta** (listado, detalle, búsqueda) | Nueva query en `application/queries/<nombre>.query.ts` y método en el Service. |
| Nueva **regla de negocio** | En `domain/` (aggregate, value object o función pura) y que el use case la use. |
| Nueva **tabla o modelo Prisma** | En `packages/database/prisma/schema.prisma`; luego repositorio en `infra/` si hace falta. |
| Nuevo **módulo de dominio** (ej. “reviews”) | Crear carpeta con `domain/ports`, `application/` (use cases + queries), `infra/`, Service, Controller, Module; seguir el patrón de `bookings/`. |
| Que otro **proceso consuma** un dominio (ej. worker) | Exponer un **context** en `contexts/<dominio>/` que implemente un port delegando en el Service del módulo. |
| Utilidad compartida (logger, fechas, etc.) | `common/` en api-gateway o paquete compartido si lo hay. |

---

## 8. Referencia rápida: bookings

- **Controller**: `bookings.controller.ts` — rutas REST, delega en `BookingsService`.
- **Service**: `bookings.service.ts` — orquestador; llama use cases y queries; `mapError` para HTTP.
- **Use cases**: `application/create-booking.usecase.ts`, `confirm-booking.usecase.ts`, `cancel-booking.usecase.ts`, `reject-booking.usecase.ts`.
- **Queries**: `application/queries/get-booking-details.query.ts`, `get-bookings-by-guest.query.ts`, `get-bookings-by-host.query.ts`.
- **Ports**: `domain/ports/bookings.repository.ts`, `payments.repository.ts`, `stripe.port.ts`, `redis.port.ts`, `bookings-query.repository.ts`.
- **Infra**: `infra/prisma-bookings.repository.ts`, `prisma-payments.repository.ts`, `stripe.port.adapter.ts`, `redis.port.adapter.ts`, etc.
- **Domain**: `domain/booking.aggregate.ts`, `booking-pricing.domain.ts`, `booking-availability.domain.ts`, `events/`.

Experiences y properties siguen el mismo patrón con menos agregados (sin aggregate ni eventos por ahora).
