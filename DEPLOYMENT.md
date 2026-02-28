# Guía de despliegue en producción

Frontend: **Vercel** | Backend: **Railway** | Base de datos: **Supabase**

---

## Orden recomendado de despliegue

1. **Supabase** — Crear proyecto y obtener `DATABASE_URL` y `DIRECT_URL`.
2. **Railway (backend)** — Desplegar API con las variables de Supabase y JWT/Stripe.
3. **Migraciones** — Ejecutar Prisma migrate contra la BD de Supabase.
4. **Vercel (frontend)** — Conectar repo, configurar `NEXT_PUBLIC_API_URL` con la URL de Railway.
5. **Stripe** — Configurar webhook con la URL de Railway y `STRIPE_WEBHOOK_SECRET`.
6. **CORS** — En Railway, poner `FRONTEND_URL` con la URL final de Vercel.

---

## 1. Supabase (base de datos)

1. Entra en [supabase.com](https://supabase.com) y crea un proyecto (región cercana a tus usuarios).
2. En **Project Settings → Database** copia:
   - **Connection string → URI** (modo Session) → usa como `DATABASE_URL` (pooled, para el backend).
   - **Connection string → Direct connection** → usa como `DIRECT_URL` (para migraciones).
3. Formato típico:
   - `DATABASE_URL`: `postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true`
   - `DIRECT_URL`: `postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres`

---

## 2. Railway (backend API)

1. Entra en [railway.app](https://railway.app) y crea un proyecto nuevo.
2. **Deploy from GitHub** y elige este repositorio.
3. **Root Directory:** deja la **raíz del repo** (`.`). No uses `apps/api-gateway` porque el backend depende de `packages/database`.
4. Railway usará el `railway.toml` de la raíz:
   - **Build:** `pnpm install && pnpm --filter @airbnb-clone/database run generate && pnpm run build --filter=api-gateway`
   - **Start:** `cd apps/api-gateway && node dist/main`
   - **Health check:** path `/health`.
5. En **Variables** del servicio, añade (sustituye por tus valores):

   | Variable | Valor |
   |---------|--------|
   | `DATABASE_URL` | URL pooled de Supabase (ver paso 1) |
   | `DIRECT_URL` | URL directa de Supabase |
   | `JWT_SECRET` | Una cadena larga y aleatoria (ej. `openssl rand -base64 32`) |
   | `STRIPE_SECRET_KEY` | `sk_live_...` o `sk_test_...` |
   | `FRONTEND_URL` | Por ahora `https://tu-app.vercel.app` (la sustituirás tras desplegar el front) |
   | `STRIPE_WEBHOOK_SECRET` | Lo añadirás después de configurar el webhook (paso 5) |

6. **PORT** lo inyecta Railway; no hace falta definirlo.
7. Tras el primer deploy, anota la **URL pública** del servicio (ej. `https://xxx.up.railway.app`). La API estará en `https://xxx.up.railway.app/api` y el health en `https://xxx.up.railway.app/health`.

### Alternativa: Docker

En la raíz del repo hay `Dockerfile.api`. Puedes usarlo en Railway eligiendo **Dockerfile** como builder y ruta `Dockerfile.api`, o para probar en local:

```bash
docker build -f Dockerfile.api -t airbnb-api .
docker run -p 4174:4174 --env-file apps/api-gateway/.env airbnb-api
```

---

## 3. Migraciones de base de datos

Con `DIRECT_URL` apuntando a Supabase, ejecuta las migraciones desde tu máquina (o desde un job en CI):

```bash
cd packages/database
cp .env.example .env   # o crea .env con DATABASE_URL y DIRECT_URL de Supabase
npx prisma generate
npx prisma migrate deploy
```

(Opcional) Cargar datos iniciales:

```bash
pnpm run db:seed
```

---

## 4. Vercel (frontend)

1. Entra en [vercel.com](https://vercel.com) y conecta este repositorio.
2. **Root Directory:** selecciona **`apps/web`** (el `vercel.json` de esa carpeta ya está preparado para el monorepo: instala y construye desde la raíz con `pnpm`).
3. En **Environment Variables** añade:

   | Variable | Valor |
   |---------|--------|
   | `NEXT_PUBLIC_API_URL` | URL del backend, incluyendo `/api` (ej. `https://xxx.up.railway.app/api`) |
   | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` o `pk_test_...` |

4. Despliega. Anota la URL del frontend (ej. `https://tu-proyecto.vercel.app`).
5. **Vuelve a Railway** y actualiza `FRONTEND_URL` con esa URL (para CORS).

---

## 5. Stripe Webhook (producción)

1. En [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks), **Add endpoint**.
2. **Endpoint URL:** `https://<tu-dominio-railway>.up.railway.app/api/payments/webhook`
3. Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`.
4. Copia el **Signing secret** (whsec_...) y en Railway añade la variable `STRIPE_WEBHOOK_SECRET`.
5. Redespliega el backend en Railway para que cargue la nueva variable.

---

## Variables de entorno requeridas (resumen)

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
