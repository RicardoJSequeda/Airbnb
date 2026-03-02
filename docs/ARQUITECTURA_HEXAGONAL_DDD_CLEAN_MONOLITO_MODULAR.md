# Arquitectura objetivo: Hexagonal + DDD + Clean en Monolito Modular (evolutivo a Event-Driven)

## 1) Diagnóstico rápido del estado actual

A nivel de repositorio ya existe una base tipo monorepo (`apps/*`, `packages/*`) con un backend NestJS en `apps/api-gateway` y un paquete compartido de datos en `packages/database`.

### Lo positivo que ya existe

- **Separación por módulos funcionales** en el backend (`bookings`, `payments`, `auth`, `properties`, `reviews`, etc.).
- **Inicio de enfoque DDD/hexagonal** en `bookings` con carpetas `domain`, `application`, `infra`.
- **Patrón Outbox** ya modelado en base de datos (`OutboxEvent`).
- **API Gateway independiente** ya existente como app separada (`apps/api-gateway`).
- **Auth centralizada** ya concentrada en módulo `auth` del gateway.

### Limitaciones actuales relevantes

- **Base de datos única**: hay un solo datasource Prisma (`DATABASE_URL`) y un schema compartido para todos los dominios.
- **Broker no alineado al objetivo**: el stack de infraestructura trae RabbitMQ, no Kafka.
- **Acoplamiento parcial de dominio con infraestructura**: aunque hay avances, gran parte de reglas/orquestación sigue en servicios de aplicación conectados a Prisma/Redis/Stripe.
- **No hay evidencia explícita** de estrategia multi-región, circuit breakers/resilience policy transversal ni observabilidad distribuida full-stack.

---

## 2) Estructura objetivo propuesta (Monolito Modular evolutivo)

> Objetivo: mantener **un único deploy lógico** (monolito modular) pero con fronteras de contexto fuertes para poder evolucionar a arquitectura orientada a eventos sin reescritura.

```text
apps/
  api-gateway/                      # borde HTTP/BFF (sin lógica de dominio)
  platform-runtime/                 # proceso principal del monolito modular (opcional si se separa del gateway)

packages/
  shared-kernel/                    # tipos compartidos mínimos (value objects cross-context)
  building-blocks/                  # utilidades de clean architecture (Result, DomainEvent, etc.)

contexts/
  bookings/
    domain/
    application/
    infrastructure/
    contracts/
  payments/
    domain/
    application/
    infrastructure/
    contracts/
  users/
    domain/
    application/
    infrastructure/
    contracts/
  listings/
    domain/
    application/
    infrastructure/
    contracts/

platform/
  messaging/                        # Kafka producer/consumer + schema registry adapters
  observability/                    # OpenTelemetry, tracing, métricas, logs correlacionados
  resilience/                       # circuit breaker, retry/backoff, timeout, bulkhead
  idempotency/                      # librería + storage para idempotency keys globales
```

### Reglas de arquitectura

1. **Domain (centro)**
   - Entidades, agregados, value objects, domain services y domain events.
   - Sin dependencias de NestJS/Prisma/Kafka/HTTP.

2. **Application (casos de uso)**
   - Orquestación de comandos/queries.
   - Depende de puertos (interfaces), nunca de adapters concretos.

3. **Infrastructure (adapters)**
   - Implementaciones de repositorios, broker, proveedores externos, cache, DB.

4. **Entrypoints**
   - Controllers HTTP, handlers de eventos, jobs.

---

## 3) Bounded Contexts solicitados

Definir explícitamente estos contextos como módulos aislados:

- **Bookings**: reservas, disponibilidad, política de cancelación, estados de booking.
- **Payments**: intents/capturas/reembolsos, ledger de pagos, reconciliación.
- **Users**: identidad, perfil, roles, lifecycle del usuario.
- **Listings**: propiedades/alojamientos, publicación, pricing base, capacidad y metadatos.

### Contratos entre contextos

- Sin acceso directo a tablas internas de otro contexto.
- Integración por:
  1. **Eventos de dominio/integración** (preferido).
  2. **ACL (anti-corruption layer)** para lecturas puntuales de transición.

---

## 4) Mapa de implementación de tus requerimientos

### 4.1 Base de datos por servicio/contexto

Para monolito modular, se puede arrancar con **database-per-context logical** y evolucionar a físico:

- Opción A (fase inicial):
  - Un clúster PostgreSQL, **un schema por contexto** (`bookings`, `payments`, `users`, `listings`).
- Opción B (fase avanzada):
  - **Una base física por contexto** con credenciales separadas.

Recomendación: iniciar con A (menor fricción) y automatizar para migrar a B cuando el volumen/aislamiento lo requiera.

### 4.2 Message broker real (Kafka)

- Sustituir/convivir con RabbitMQ con stack Kafka (KRaft).
- Implementar **Outbox Relay**:
  1. Caso de uso persiste estado + outbox en una transacción.
  2. Relay publica a Kafka (`booking.created`, `payment.completed`, etc.).
  3. Marca `processedAt`.

### 4.3 API Gateway independiente

Ya existe app separada; reforzar su rol:

- Solo composición, authN/authZ, rate limits, routing/versionado.
- Sin reglas de negocio de dominio.

### 4.4 Autenticación centralizada

Mantener `Users/Auth` como fuente central:

- Issuer único de tokens (OIDC/JWT).
- Claims estándar (`sub`, `orgId`, `roles`, `scopes`, `sessionId`).
- Propagación de identidad al bus/eventos por metadata.

### 4.5 Observabilidad distribuida

- OpenTelemetry end-to-end (HTTP + DB + Kafka + Redis).
- Correlation IDs globales (`traceId`, `spanId`, `requestId`).
- Stack sugerido: OTEL Collector + Jaeger/Tempo + Prometheus + Grafana + Loki.

### 4.6 Circuit breakers

- Aplicar en adapters externos (Stripe, servicios terceros, API externas).
- Librería de resiliencia transversal (p. ej. Opossum o wrapper propio).
- Política por dependencia: timeout, umbral de error, half-open probes.

### 4.7 Retries con backoff

- Reintentos solo en errores transitorios.
- Exponencial con jitter.
- Reglas diferentes para HTTP sync y consumidores Kafka async.
- Dead-letter topics para eventos agotados.

### 4.8 Idempotency keys globales

- Tabla/almacén central de idempotencia:
  - `idempotency_key`, `actor_id`, `operation`, `payload_hash`, `result_hash`, `status`, `expires_at`.
- Aplicación en:
  - Comandos HTTP mutables.
  - Consumidores de eventos (exactly-once semántico a nivel de negocio).

### 4.9 Multi-region strategy

Estrategia pragmática por etapas:

1. **Active-Passive** inicial (DR): réplica en región secundaria + failover.
2. **Active-Active parcial** para lecturas y APIs no críticas.
3. Regionalización de Kafka y storage con replication policy definida.

Consideraciones clave:

- Latencia por contexto (bookings/payments son sensibles).
- Consistencia eventual inter-región.
- Claves globales (UUIDv7/ULID) para evitar colisiones.

---

## 5) Roadmap recomendado (incremental, sin big-bang)

### Fase 0 — Arquitectura y gobierno
- Definir decision records (ADR) para cada capability.
- Definir reglas de dependencia por capas y contexto (lint arquitectónico).

### Fase 1 — Fronteras de contexto
- Reorganizar carpetas por contextos solicitados.
- Extraer contratos (puertos) y mover reglas a dominio puro.

### Fase 2 — Data ownership
- Separar schemas/bases por contexto.
- Eliminar joins cruzados entre contextos.

### Fase 3 — Event-driven base
- Formalizar Outbox + Relay + Kafka topics + versionado de eventos.
- Crear consumidores internos por contexto.

### Fase 4 — Resilience + Idempotency + Observability
- Introducir paquete transversal de resiliencia.
- Idempotencia global para comandos/eventos.
- OTEL + dashboards + alertas SLO.

### Fase 5 — Multi-región
- DR tested failover.
- Estrategia de particionado regional por dominio y tráfico.

---

## 6) Definición de Done arquitectónica (checklist)

- [ ] Cada contexto compila y testea sin importar infraestructura de otros contextos.
- [ ] No existe acceso directo a tablas de otro contexto.
- [ ] Toda integración cross-context tiene contrato explícito (evento o ACL).
- [ ] Outbox en producción con métricas de lag/publicación.
- [ ] Política homogénea de retries/circuit breaker/timeouts.
- [ ] Idempotency key aplicada en endpoints críticos y handlers asíncronos.
- [ ] Trazas distribuidas enlazan request HTTP → DB → evento Kafka → consumidor.
- [ ] Runbook multi-región documentado y probado con simulacros.


## 7) Estado de implementación en este repositorio

Implementado en código (baseline):

- Módulos de contexto: `contexts/bookings`, `contexts/payments`, `contexts/users`, `contexts/listings`.
- Capa `platform` con:
  - Observabilidad básica por `CorrelationIdInterceptor`.
  - Idempotencia declarativa por endpoint con `@RequireIdempotency()` + Redis (`SET NX EX`) y fallback in-memory.
  - Resilience services (`executeWithRetry`, `CircuitBreakerService`).
  - Outbox relay (`OutboxRelayService`) que lee `outbox_events`, publica por adapter Kafka y marca `processedAt`.
- `docker-compose` migrado a Kafka-compatible runtime (Redpanda) para pruebas locales de eventing real.

Pendiente (siguiente iteración):

- Conectar `KafkaPublisherService` a cliente real (`kafkajs`) y gestión de topic provisioning.
- Persistencia de idempotencia con modelo propio en BD para auditoría y TTL cleaning.
- Telemetría OTEL completa (traces/metrics/logs) y dashboards operativos.
- Separación física de DB por bounded context (hoy: logical modularization sobre schema único).
