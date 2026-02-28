# 🏠 SaaS Multi-Tenant Marketplace Engine

Motor de marketplace tipo alojamientos y experiencias: **multi-tenant**, listo para monetización (comisión de plataforma), con API pública/dashboard separadas y stack moderno.

No es un clone académico: es una base **production-ready** para un SaaS de reservas (propiedades, experiencias, pagos con Stripe, reseñas, favoritos).

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![NestJS](https://img.shields.io/badge/NestJS-10-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)
![Stripe](https://img.shields.io/badge/Stripe-Integrated-008CDD)

## 🎯 Features

### Backend (NestJS)
- ✅ **API dual:** rutas **públicas** (marketplace) y **dashboard** (por organización), documentadas abajo
- 🔐 **JWT + RBAC:** roles GUEST, HOST, ADMIN, SUPER_ADMIN; aislamiento por organización
- 🏢 **Multi-tenant:** Organization, Subscription (FREE/PRO/ENTERPRISE), OrganizationGuard
- 💳 **Stripe:** webhooks, idempotencia, validación de firma; comisión de plataforma con `Decimal`
- 🏠 **Properties & Experiences:** CRUD, publish/unpublish, búsqueda pública
- 📅 **Bookings** con estados y pagos; **Reviews** y **Favorites**
- 🛡️ **Seguridad:** Helmet, Throttler (rate limiting), CORS por entorno
- 📊 **Prisma + PostgreSQL:** montos financieros en `Decimal`, no `Float`

---

## 🏗️ Architecture

```
├── apps/
│   ├── api-gateway/         # NestJS Backend
│   │   ├── src/
│   │   │   ├── auth/        # JWT, register, login
│   │   │   ├── properties/  # public + dashboard
│   │   │   ├── experiences/ # public + dashboard
│   │   │   ├── locations/   # public (suggestions, cities)
│   │   │   ├── bookings/    # reservas
│   │   │   ├── payments/    # Stripe, comisión
│   │   │   ├── reviews/     # reseñas
│   │   │   ├── favorites/   # wishlist
│   │   │   ├── health/      # health check
│   │   │   └── common/      # guards, filters, Prisma, commission utils
│   │   └── test/
│   │
│   └── web/                 # Next.js Frontend
│       └── src/app, components, lib, types
│
└── packages/
    └── database/            # Prisma schema & migrations
        └── prisma/
```

### Estructura actual (monorepo pnpm + Turbo)

El proyecto es un **monorepo** con una sola estructura activa:

| Ruta | Descripción |
|------|-------------|
| `apps/api-gateway/` | Backend NestJS (API, auth, bookings, experiences, payments, reviews, etc.) |
| `apps/web/` | Frontend Next.js (páginas, componentes, experiencias, propiedades, búsqueda) |
| `packages/database/` | Prisma: schema y migraciones compartidas |

**Raíz:** `package.json` (scripts Turbo), `pnpm-workspace.yaml` (`apps/*`, `packages/*`), `turbo.json`, `docker-compose.yml`, `.gitignore` (incluye `.pnpm-store`).

**Desarrollo:**
- `pnpm dev` — levanta todo
- `pnpm dev:web` — solo frontend
- `pnpm dev:gateway` — solo backend

### Capas y separación de responsabilidades

El backend sigue una **arquitectura en capas** con separación clara de responsabilidades:

- **Puerto HTTP (Controllers):** definen rutas públicas vs dashboard, reciben DTOs y delegan en servicios. No contienen lógica de negocio ni acceso directo a datos.
- **Capa de aplicación (Services):** orquestan reglas de negocio, uso de Prisma, cálculos (p. ej. comisión en `commission.utils.ts`) y llamadas externas (Stripe). La lógica de dominio (qué es una reserva válida, cuándo aplicar comisión) vive aquí.
- **Adaptadores de infraestructura:** Prisma como adaptador de persistencia; cliente HTTP/Stripe para pagos. Configuración (env, Redis) inyectada vía Nest.
- **Guards y filtros:** autenticación (JWT), autorización por rol y organización (OrganizationGuard, SubscriptionGuard) y manejo global de excepciones (GlobalExceptionFilter) actúan en el borde de la aplicación, sin mezclar seguridad con lógica de negocio.

Con esto se consigue **dominio e infraestructura desacoplados**: se puede cambiar BD o proveedor de pago sin reescribir la lógica de comisiones o reservas.

---

## 🏢 Multi-Tenant SaaS Architecture

La plataforma es **multi-tenant**: varias organizaciones (tenants) conviven en la misma instalación.

- Cada **Organization** tiene datos aislados: propiedades, reservas, pagos, experiencias, reseñas.
- Cada organización tiene una **Subscription** (plan: FREE / PRO / ENTERPRISE; status: ACTIVE, CANCELED, PAST_DUE).
- Las rutas de **dashboard** están protegidas por **OrganizationGuard**: el `organizationId` sale del JWT y se aplica a todas las consultas. No se expone en query params públicos.

**Roles:**

| Rol | Alcance |
|-----|--------|
| GUEST | Usuario estándar (reservas, reseñas, favoritos) |
| HOST | Gestión de propiedades/experiencias de su org |
| ADMIN | Administración dentro de la organización |
| SUPER_ADMIN | Acceso cross-organization (sin atarse a una org) |

Los usuarios pertenecen a una organización (`User.organizationId`); solo SUPER_ADMIN puede tener `organizationId` nulo.

---

## 🔐 Security

- **JWT** para autenticación (access tokens).
- **RBAC:** guards por rol y por organización (OrganizationGuard, SubscriptionGuard).
- **Aislamiento por tenant:** todas las queries dashboard filtran por `organizationId`.
- **Stripe webhooks:** validación de firma (`STRIPE_WEBHOOK_SECRET`); manejo **idempotente** de eventos (evita doble aplicación de comisión).
- **Rate limiting:** Throttler (NestJS) aplicado globalmente.
- **Helmet** para cabeceras HTTP de seguridad.
- **CORS** configurado por entorno (`FRONTEND_URL` / orígenes permitidos).

---

## 💰 Platform Commission System

La plataforma aplica una **comisión** sobre cada pago completado.

- **Variable de entorno:** `PLATFORM_FEE_PERCENTAGE` (porcentaje, ej. `10` para 10%).
- **Cálculo** con **Prisma.Decimal** (no float) en `commission.utils.ts`; redondeo a 2 decimales.
- En el modelo **Payment** se persisten:
  - `platformFeeAmount` — comisión de la plataforma
  - `hostNetAmount` — neto para el host (amount - platformFee)
- La comisión se calcula **solo** en la transición **PENDING → COMPLETED** (webhook o confirmación). Si el pago ya tiene `platformFeeAmount`, no se recalcula (idempotencia).

---

## 🚀 Tech Stack

### Backend
- **Framework:** NestJS 10
- **Language:** TypeScript 5
- **Database:** Prisma ORM + PostgreSQL (montos en `Decimal`)
- **Auth:** JWT; guards por rol y organización
- **Payments:** Stripe (webhooks, idempotencia, comisión de plataforma)
- **Seguridad:** Helmet, Throttler, CORS
- **Validation:** class-validator, class-transformer

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **Styling:** TailwindCSS + shadcn/ui
- **State:** Zustand
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **UI Components:** Radix UI + shadcn/ui

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- pnpm 8+

### Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/airbnb-fullstack-clone.git
cd airbnb-fullstack-clone
pnpm install
```

### Setup Database (Supabase PostgreSQL)

1. Crear proyecto en [Supabase](https://supabase.com) y obtener connection strings en Project Settings > Database.
2. Configurar `packages/database/.env` y `apps/api-gateway/.env` con `DATABASE_URL` y `DIRECT_URL`.
3. Opcional: usar PostgreSQL local con `docker-compose up -d postgres`.
4. Ejecutar migraciones:

```bash
cd packages/database
npx prisma generate
npx prisma migrate deploy
```

### Environment Variables

**Backend** (`apps/api-gateway/.env`):
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
REDIS_URL="redis://localhost:6379"  # opcional
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
PLATFORM_FEE_PERCENTAGE=10
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`apps/web/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🏃 Running the Project

### Development Mode

**Backend:**
```bash
cd apps/api-gateway
pnpm run start:dev
# Server runs on http://localhost:3001
```

**Frontend:**
```bash
cd apps/web
pnpm run dev
# App runs on http://localhost:3000
```

### Production Build
```bash
# Backend
cd apps/api-gateway
pnpm run build
pnpm run start:prod

# Frontend
cd apps/web
pnpm run build
pnpm run start
```

---

## 📡 API Endpoints

Todas las rutas tienen prefijo **`/api`**. La API está dividida en:

- **Públicas:** sin auth, para el marketplace (listados, detalle, búsqueda).
- **Dashboard:** requieren JWT + organización; filtradas por `organizationId` (OrganizationGuard).

### Authentication
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuario actual

### Properties
| Método | Ruta | Alcance | Descripción |
|--------|------|---------|-------------|
| GET | `/api/public/properties` | Público | Listar propiedades (query: city, country, etc.) |
| GET | `/api/public/properties/:id` | Público | Detalle de una propiedad |
| POST | `/api/dashboard/properties` | Dashboard | Crear propiedad (Host, org) |
| GET | `/api/dashboard/properties` | Dashboard | Listar propiedades de la org |
| GET | `/api/dashboard/properties/:id` | Dashboard | Detalle (org) |
| PATCH | `/api/dashboard/properties/:id` | Dashboard | Actualizar (org) |
| DELETE | `/api/dashboard/properties/:id` | Dashboard | Eliminar (org) |
| PATCH | `/api/dashboard/properties/:id/publish` | Dashboard | Publicar (org) |

### Experiences
| Método | Ruta | Alcance | Descripción |
|--------|------|---------|-------------|
| GET | `/api/public/experiences` | Público | Listar experiencias (city, country, etc.) |
| GET | `/api/public/experiences/:id` | Público | Detalle experiencia |
| POST | `/api/dashboard/experiences` | Dashboard | Crear experiencia (org) |
| GET | `/api/dashboard/experiences` | Dashboard | Listar por org |
| GET/PATCH/DELETE | `/api/dashboard/experiences/:id` | Dashboard | CRUD (org) |
| PATCH | `/api/dashboard/experiences/:id/publish` | Dashboard | Publicar (org) |

### Bookings
- `POST /api/bookings` - Crear reserva (auth)
- `GET /api/bookings/my-bookings` - Mis reservas
- `GET /api/bookings/host-bookings` - Reservas del host (org)
- `GET /api/bookings/:id` - Detalle
- `PATCH /api/bookings/:id/confirm` | `/:id/cancel` | `/:id/reject` - Cambiar estado (Host)

### Payments
- `POST /api/payments/create-intent` - Crear payment intent
- `POST /api/payments/confirm` - Confirmar pago (idempotente; aplica comisión PENDING→COMPLETED)
- `GET /api/payments/booking/:bookingId` - Pago de una reserva
- `POST /api/payments/:id/refund` - Reembolso
- `POST /api/payments/webhook` - Stripe webhook (firma validada)

### Reviews
- `POST /api/reviews` - Crear reseña
- `GET /api/reviews/property/:propertyId` - Reseñas de una propiedad
- `GET /api/reviews/my-reviews` - Mis reseñas
- `GET /api/reviews/:id` | `PATCH` | `DELETE` - Detalle / actualizar / eliminar

### Favorites
- `POST /api/favorites/:propertyId` - Añadir
- `DELETE /api/favorites/:propertyId` - Quitar
- `POST /api/favorites/toggle/:propertyId` - Toggle
- `GET /api/favorites` - Listar míos
- `GET /api/favorites/check/:propertyId` | `count/:propertyId` - Estado y conteo

### Locations (público)
- `GET /api/public/locations/suggestions` - Sugerencias para búsqueda
- `GET /api/public/locations/cities/:citySlug/places` - Lugares por ciudad
- `GET /api/public/locations/departments` - Departamentos
- `GET /api/public/locations/search` - Búsqueda

---

## 🧪 Testing

### API Testing
```bash
# Use REST Client extension in VS Code
# Open apps/api-gateway/test/complete-test.http
```

---

## 📊 Database Schema

**Importante:** Los montos monetarios usan **`Decimal`** (Prisma `@db.Decimal(10, 2)`), no `Float`, para evitar errores de redondeo en producción.

**Multi-tenant:** `Organization` y `Subscription`; entidades como Property, Booking, Payment, Experience están ligadas a `organizationId`.

```prisma
// Multi-tenant
model Organization {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  // ... relations: users, subscriptions, properties, bookings, payments, experiences
}

model Subscription {
  id             String             @id @default(uuid())
  organizationId String
  plan           SubscriptionPlan   @default(FREE)   // FREE | PRO | ENTERPRISE
  status         SubscriptionStatus @default(ACTIVE) // ACTIVE | CANCELED | PAST_DUE
  // ...
}

model User {
  id             String    @id @default(uuid())
  email          String    @unique
  name           String
  role           UserRole  @default(GUEST)  // GUEST | HOST | ADMIN | SUPER_ADMIN
  organizationId String?   // null solo para SUPER_ADMIN
  organization   Organization? @relation(...)
  // ...
}

model Property {
  // ...
  price          Decimal  @db.Decimal(10, 2)
  organizationId String
  organization   Organization @relation(...)
}

model Booking {
  // ...
  totalPrice     Decimal  @db.Decimal(10, 2)
  organizationId String
}

model Payment {
  // ...
  amount             Decimal  @db.Decimal(10, 2)
  platformFeeAmount  Decimal? @db.Decimal(10, 2)
  hostNetAmount      Decimal? @db.Decimal(10, 2)
  organizationId     String
}
```

El schema completo está en `packages/database/prisma/schema.prisma` (Property, Booking, Payment, Review, Favorite, Experience, etc.).

---

## 🎨 UI Components

Built with **shadcn/ui**:
- Button, Input, Card, Dialog
- Dropdown Menu, Avatar, Badge
- Calendar, Select, Form
- Toast notifications
- Skeleton loaders
- And more...

---

## 🚀 Deployment Architecture

El proyecto está preparado para un despliegue profesional en la nube:

| Componente | Plataforma | Descripción |
|------------|------------|-------------|
| **Frontend** | Vercel | Next.js 15 con App Router, despliegue automático desde Git |
| **Backend** | Railway | NestJS API, usa `PORT` de entorno, escalado automático |
| **Database** | Supabase | PostgreSQL gestionado, pooler para producción |

### Configuración por plataforma

**Vercel (Frontend):**
- Variable: `NEXT_PUBLIC_API_URL` → URL del backend en Railway (ej: `https://api.xxx.up.railway.app/api`)
- Build: `pnpm run build`
- Output: estándar Next.js

**Railway (Backend):**
- Variables: `DATABASE_URL`, `DIRECT_URL`, `SUPABASE_JWT_SECRET`, `FRONTEND_URL`, `STRIPE_*`
- Build: `pnpm run build`
- Start: `pnpm run start:prod` (ejecuta `node dist/main.js`)
- Puerto: Railway inyecta `PORT` automáticamente

**Supabase (Database):**
- Pooled (`DATABASE_URL`) para runtime del backend
- Direct (`DIRECT_URL`) para migraciones con `prisma migrate deploy`

### Health Check
- `GET /health` → `{ "status": "OK" }` (sin prefijo /api)
- Usar en Railway para health checks de despliegue

---

## 🚀 Deployment

### Backend (Railway)
```bash
cd apps/api-gateway
pnpm run build
pnpm run start:prod
```

### Frontend (Vercel)
```bash
cd apps/web
pnpm run build
pnpm run start
```

---

## 📝 License

MIT License - feel free to use this project for learning purposes.

---

## 👨‍💻 Author

**Gherson**
- GitHub: [@YOUR_USERNAME]
- LinkedIn: [Your LinkedIn]

---

## 🙏 Acknowledgments

- Inspirado en marketplaces de reservas (alojamientos y experiencias).
- Pensado como base **SaaS multi-tenant** y portfolio técnico; no afiliado a ninguna marca.

---

## 📧 Contact

For questions or collaboration: your.email@example.com

---

**⭐ If you found this project helpful, please give it a star!**