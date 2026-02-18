# Guía de despliegue en producción

Frontend: **Vercel** | Backend: **Railway** | Base de datos: **Supabase**

---

## Variables de entorno requeridas

### Backend (Railway)

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `DATABASE_URL` | Sí | URL pooled de Supabase (PgBouncer) |
| `DIRECT_URL` | Sí | URL directa para migraciones |
| `JWT_SECRET` | Sí | Clave secreta para JWT |
| `STRIPE_SECRET_KEY` | Sí | Clave secreta de Stripe (sk_live_...) |
| `FRONTEND_URL` | Sí | URL del frontend en Vercel (ej: `https://tu-app.vercel.app`). Múltiples orígenes separados por coma |
| `STRIPE_WEBHOOK_SECRET` | Sí (con webhooks) | Clave del webhook en Stripe Dashboard (whsec_...) |
| `PORT` | Auto | Railway lo inyecta automáticamente |

### Frontend (Vercel)

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `NEXT_PUBLIC_API_URL` | Sí | URL base del backend en Railway (ej: `https://tu-api.up.railway.app/api`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Sí (pagos) | Clave pública de Stripe (pk_live_...) |

---

## Stripe Webhook en producción

### URL del webhook

```
https://<tu-dominio-api>.up.railway.app/api/payments/webhook
```

Ejemplo: `https://airbnb-api.up.railway.app/api/payments/webhook`

### Configuración en Stripe Dashboard

1. Ir a **Developers > Webhooks**
2. **Add endpoint**
3. URL: `https://tu-dominio-api.up.railway.app/api/payments/webhook`
4. Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
5. Copiar el **Signing secret** (whsec_...) y configurarlo como `STRIPE_WEBHOOK_SECRET` en Railway

### Comportamiento

- El endpoint usa **raw body** (sin parsear JSON) para verificar la firma correctamente
- Verifica la firma con `STRIPE_WEBHOOK_SECRET`
- No depende de localhost; funciona con cualquier dominio

---

## Health check

- **URL:** `GET https://tu-api.up.railway.app/health` (sin prefijo `/api`)
- **Respuesta:** `{ status, timestamp, db, stripe }`
- Usar en Railway para health checks de despliegue

---

## CORS

El backend permite solo los orígenes definidos en `FRONTEND_URL`. En producción:

```
FRONTEND_URL=https://tu-app.vercel.app
```

Para varios dominios (ej: preview + producción):

```
FRONTEND_URL=https://tu-app.vercel.app,https://tu-app-preview.vercel.app
```
