# Marketplace SaaS Multi-Tenant

Motor de marketplace (alojamientos y experiencias) multi-tenant, con API pública/dashboard, monetización por comisión y stack moderno.

---

## Tecnologías

### Backend
| Área | Tecnología |
|------|------------|
| Framework | NestJS 11 |
| Lenguaje | TypeScript 5 |
| ORM / BD | Prisma + PostgreSQL (montos en `Decimal`) |
| Auth | JWT, Supabase JWT; RBAC (GUEST, HOST, ADMIN, SUPER_ADMIN) |
| Pagos | Stripe (webhooks, idempotencia, comisión de plataforma) |
| Cache | Redis (opcional) |
| Validación | class-validator, class-transformer |
| Seguridad | Helmet, Throttler, CORS |

### Frontend
| Área | Tecnología |
|------|------------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS |
| Componentes | shadcn/ui, Radix UI |
| Estado | Zustand |
| Formularios | React Hook Form + Zod |
| HTTP | Axios |
| Pagos | Stripe React (Elements) |
| Auth / BD | Supabase (Auth, opcional) |

### Infra y herramientas
| Área | Tecnología |
|------|------------|
| Monorepo | pnpm workspaces + Turborepo |
| Contenedores | Docker / Docker Compose |
| Despliegue | Vercel (frontend), Railway (backend), Supabase (PostgreSQL) |

---

## Arquitectura

### Monorepo

```
├── apps/
│   ├── api-gateway/          # Backend NestJS
│   │   └── src/
│   │       ├── auth/         # JWT, registro, login, OAuth
│   │       ├── properties/   # público + dashboard
│   │       ├── experiences/  # público + dashboard
│   │       ├── locations/    # sugerencias, ciudades
│   │       ├── bookings/     # DDD: domain, application, infra
│   │       ├── payments/     # Stripe, comisión
│   │       ├── reviews/
│   │       ├── favorites/
│   │       ├── health/
│   │       └── common/       # guards, filters, Prisma, Redis
│   └── web/                  # Frontend Next.js
│       └── src/              # app, components, lib, features, config
└── packages/
    └── database/             # Prisma schema y migraciones
```

### Backend: capas y responsabilidades

- **HTTP (Controllers):** rutas públicas vs dashboard, DTOs, delegan en servicios.
- **Aplicación (Services / Use cases):** orquestación, reglas de negocio, Prisma, Stripe, comisiones.
- **Dominio (bookings):** agregados, value objects, puertos (repositorios, Stripe, Redis).
- **Infraestructura:** adaptadores Prisma, Stripe, Redis; inyección vía Nest.
- **Borde:** Guards (JWT, rol, organización, suscripción), filtros de excepciones.

Multi-tenant: datos aislados por `Organization`; rutas dashboard filtradas por `organizationId` (OrganizationGuard). Suscripciones: FREE / PRO / ENTERPRISE.

### Diseño (frontend)

- **Sistema de diseño:** Tailwind + shadcn/ui (Radix).
- **Componentes:** Button, Card, Dialog, Dropdown, Avatar, Badge, Calendar, Select, Form, Toast, Skeleton, Map (Leaflet).
- **UX:** Framer Motion (animaciones), búsqueda con sugerencias y routing por URL, modales (login, registro, compartir).
- **Responsive:** layouts y componentes adaptados a móvil y escritorio.
