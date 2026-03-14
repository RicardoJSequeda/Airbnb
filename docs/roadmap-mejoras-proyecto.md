# Roadmap de mejoras (ordenado)

Este roadmap convierte las recomendaciones en una secuencia ejecutable por fases.

## Fase 1 (crítico) — flujo de anuncios host

1. ✅ **Consistencia de listados por estado**
   - Backend dashboard soporta filtro `status` (`DRAFT` / `PUBLISHED`).
   - Cache dashboard incluye `status` en la clave para evitar colisiones.
   - Objetivo: que el host vea correctamente borradores y publicados.

2. ✅ **Persistencia de draft en backend (por pasos)**
   - Endpoint draft incremental implementado (`PATCH /dashboard/properties/:id/draft`).
   - Creación de draft mínimo al iniciar wizard (`POST /dashboard/properties/draft`) y actualización por bloques.
   - Objetivo logrado: reanudar progreso sin depender únicamente de localStorage.

3. ⏳ **UX de finalización robusta**
   - Mantener feedback de envío/errores.
   - Agregar códigos de error tipados (suscripción, auth, validación) con mensajes específicos.

## Fase 2 (alto impacto) — calidad y observabilidad

4. ⏳ **Telemetría de funnel del wizard**
   - Events por paso (`view`, `blocked`, `submit_success`, `submit_fail`).

5. ⏳ **E2E de flujos críticos**
   - Crear anuncio host completo.
   - Ver aparición en `/host/listings`.
   - Ver no aparición pública hasta `PUBLISHED`.

6. ⏳ **Observabilidad backend**
   - Métricas p95/p99 en `POST /dashboard/properties`.
   - Tasa de error por endpoint y por organización.

## Fase 3 (escalado) — modelo y seguridad

7. ⏳ **Catálogos canónicos de dominio**
   - `propertyType`, amenities y reglas por región.

8. ⏳ **Seguridad de sesión frontend**
   - Evaluar migración de token en localStorage a cookies httpOnly.

9. ⏳ **Optimización de carga de listados**
   - SWR/React Query por vistas críticas.
   - Mejoras de imagen y skeletons.

## Definición de éxito

- Un host crea un anuncio y lo ve de inmediato en dashboard con estado correcto.
- El marketplace público sólo muestra propiedades publicadas.
- No hay datos stale después de create/update/publish.
- Existe trazabilidad de abandono del wizard y alertas sobre fallos de creación.

