# Por qué no se muestran datos desde la base de datos

## Flujo de datos

1. **Frontend (Next.js)** llama a `GET /api/public/properties` (baseURL = `/api` en localhost).
2. **Next.js** reescribe `/api/*` al API Gateway (por defecto `http://localhost:4174/api/*`).
3. **API Gateway** usa Prisma para consultar solo propiedades con `status: 'PUBLISHED'`.
4. Si la BD falla o no hay datos, el frontend muestra "No hay propiedades disponibles".

## Causas habituales

### 1. Base de datos no conectada

- **Variable `DATABASE_URL`** no definida o incorrecta en el API Gateway.
- La base de datos (PostgreSQL/Supabase) no está accesible o no existe.

**Comprobar:**  
Con el API corriendo, abre `GET http://localhost:4174/health`. Si `db === 'error'`, la BD no está conectada.

**Solución:**  
Crea o revisa `.env` en la raíz o en `apps/api-gateway` con `DATABASE_URL` y `DIRECT_URL` (ver `DEPLOYMENT.md`). Asegúrate de que las migraciones estén aplicadas:

```bash
cd packages/database
npx prisma migrate deploy
```

### 2. No hay propiedades con status PUBLISHED

La API **solo devuelve** propiedades con `status: 'PUBLISHED'`. Por defecto las nuevas son `DRAFT`.

**Comprobar:**  
`GET http://localhost:4174/api/public/diagnostic` devuelve `publishedCount`. Si es 0, no hay propiedades publicadas.

**Solución:**  
Ejecuta el seed para crear datos de prueba (propiedades ya en PUBLISHED):

```bash
cd packages/database
pnpm run db:seed
```

O publica una propiedad desde el dashboard (acción "Publicar") para que pase de DRAFT a PUBLISHED.

### 3. API Gateway no está en marcha o no es accesible

Si el frontend corre pero el API no, las peticiones a `/api/*` fallan y verás lista vacía o error de red.

**Comprobar:**  
Abre `http://localhost:4174/health` en el navegador. Debe responder JSON.

**Solución:**  
En desarrollo, arranca todo con `pnpm dev` o el API solo con `pnpm dev:gateway` (puerto 4174). El frontend debe usar por defecto `NEXT_PUBLIC_API_URL` sin definir en local, para que el proxy apunte a `http://localhost:4174`.

### 4. Endpoint de diagnóstico no existía (corregido)

El controlador `DiagnosticController` no estaba registrado en `HealthModule`, por lo que `GET /api/public/diagnostic` devolvía 404.  
**Corrección aplicada:** `DiagnosticController` está registrado en `apps/api-gateway/src/health/health.module.ts`. Tras actualizar, el script `node apps/api-gateway/scripts/test-api.mjs` puede usar el diagnóstico correctamente.

## Script de verificación

Con el API Gateway corriendo en el puerto por defecto:

```bash
cd apps/api-gateway
node scripts/test-api.mjs
```

El script comprueba:

- `/health` → estado de BD (`db: 'ok' | 'error'`).
- `/api/public/diagnostic` → `dbConnected`, `publishedCount` y mensajes de ayuda.
- `/api/public/properties` → que devuelva array de propiedades.

Si algo falla, los mensajes en consola indican el siguiente paso (revisar `DATABASE_URL`, ejecutar seed, etc.).
