# Target Architecture v2 (evolutiva hacia escala tipo Airbnb)

## Objetivo

Convertir el monolito modular actual en una plataforma por contextos con contratos explícitos, operación event-driven y observabilidad orientada a SLOs, sin reescritura big-bang.

## Cambios aplicados en esta iteración

1. **Boundary más fuerte en contextos de Bookings y Payments**
   - Se añadieron puertos de contexto (`BOOKINGS_CONTEXT_PORT`, `PAYMENTS_CONTEXT_PORT`).
   - Se añadieron servicios de contexto (`BookingsContextService`, `PaymentsContextService`) para exponer contratos de aplicación estables.

2. **Madurez operativa del Outbox**
   - Métricas etiquetadas por región/tipo/estado.
   - Nuevos gauges operativos: `outbox_pending_events`, `outbox_dead_letter_events`, `outbox_oldest_pending_age_seconds`, `outbox_batch_size`.
   - Histograma liviano de edad de eventos para análisis de p50/p95.

3. **Cierre inicial del funnel host (supply)**
   - `/host/alojamiento`, `/host/experiencia` y `/host/servicio` ya permiten capturar borrador inicial.
   - Se guarda progreso en `localStorage` para no perder avance.

## Siguiente fase recomendada

### Fase 1 (2–4 semanas)
- CI gates por paquete (lint + test + build).
- Contrato de error estándar (`problem+json` o envelope único).
- SLOs iniciales: p95 latencia, error rate, outbox lag, webhook success rate.

### Fase 2 (1–2 meses)
- CQRS real en consultas de búsqueda/listados.
- Eventos versionados por contexto con política de compatibilidad.
- Workers dedicados para outbox por tipo de tópico.

### Fase 3 (2–3 meses)
- Particionado temporal/regional de bookings/payments/outbox.
- Read models materializados para consultas globales.
- Cache multinivel (CDN + edge + Redis hot paths).

### Fase 4 (producto a escala)
- Search service dedicado (ranking + geo + personalización).
- Pricing/availability engine independiente.
- Trust & Safety y plataforma de experimentación (feature flags/A-B).
