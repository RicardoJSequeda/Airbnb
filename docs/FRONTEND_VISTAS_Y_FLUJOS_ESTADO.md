# Vistas y flujos: estado actual del frontend

## Vistas y flujos que sí están implementados

Del árbol de rutas (`apps/web/src/app`) se ven implementadas estas vistas principales.

### Descubrimiento y detalle

- `/` (home principal, listado de alojamientos)
- `/search` (búsqueda)
- `/properties/[id]` y `/properties/[id]/book` (detalle de alojamiento y flujo de reserva)
- `/experiences`, `/experiences/search`, `/experiences/[id]`, `/experiences/[id]/book` (experiencias y reserva)

### Cuenta y actividad

- `/login`, `/register`, `/auth/callback`
- `/my-bookings` (mis reservas)
- `/my-reviews` (mis reseñas)

### Pagos

- `/checkout` (pago con Stripe Elements, usando `useCheckoutSession` y `CheckoutForm`)
- `/checkout/success` (pantalla de éxito del pago)

### Contenido informativo

- `/help`, `/services`, `/terms`, `/terms/privacy`, `/about/company-details`

### Host onboarding

- `/host` (landing de anfitrión con `ShareHostModal`)
- `/host/onboarding` (onboarding con pasos y CTA “Comencemos” que redirige a `/host/[type]`)

Todos los enlaces revisados en el header (`/help`, `/invite`, `/cohost`, `/my-bookings`, `/my-reviews`, etc.) tienen al menos una página `page.tsx` creada, por lo que no se detectan enlaces rotos tipo 404 en esas rutas.

## Vistas y flujos que están solo como placeholder

### Publicar alojamiento

- Ruta: `/host/alojamiento` (`HostAlojamientoPage`)
- Texto actual: “Esta sección estará disponible pronto con el proceso completo para publicar tu alojamiento.”
- Estado: vista estática sin formulario ni pasos de publicación.

### Publicar experiencia

- Ruta: `/host/experiencia` (`HostExperienciaPage`)
- Texto actual: “Esta sección estará disponible pronto con el proceso completo para publicar tu experiencia.”
- Estado: vista estática sin flujo de creación.

### Servicios como host

- Ruta: `/host/servicio`
- Estado: página informativa; no hay flujo de alta de servicio.

### Onboarding de host hacia creación real

El botón “Comencemos” en `/host/onboarding` ejecuta:

- `router.push(`/host/${type}`)`

Donde `type` puede ser `alojamiento`, `experiencia` o `servicio`.

Situación actual:

- Para `alojamiento` y `experiencia` sí existen rutas (`/host/alojamiento`, `/host/experiencia`), pero están en modo “disponible pronto”.
- Para `servicio` existe la ruta `/host/servicio`, pero también está en modo informativo/placeholder.

Conclusión: el funnel de “conviértete en anfitrión” está maquetado (modal, onboarding, CTA), pero el proceso real de creación/publicación aún no está implementado.

### Invitar anfitrión

- Ruta: `/invite` (`InvitePage`)
- Texto actual: “Invita a alguien a formar parte de la plataforma como anfitrion. Proximamente.”
- Estado: página estática sin formulario ni lógica para invitaciones.

### Cohost

- Ruta: `/cohost` (`CohostPage`)
- Texto actual: “Busca o anúnciate como coanfitrión… Próximamente.”
- Estado: sin buscador ni creación de ofertas de cohost; solo contenido placeholder.

## Botones con flujo incompleto o pendiente

### Botón “Comencemos” (onboarding host)

Existe el flujo hasta redirigir a `/host/[tipo]`, pero falta el proceso de creación real:

- `/host/alojamiento`: falta wizard de alta de alojamiento.
- `/host/experiencia`: falta wizard de alta de experiencia.
- `/host/servicio`: falta flujo de creación; actualmente solo contenido placeholder.

### Botones/acciones de cohost e invitaciones

Desde el menú de usuario (`/cohost`, `/invite`) se accede a páginas “Próximamente”.

Falta implementar:

- formularios de invitación/cohost,
- listados,
- integración backend.

### Descarga de imágenes de experiencia

En `ExperienceDetail` existe un modal `ImageCarouselModal` con comentario:

- `// TODO: Implementar descarga`

La lógica de descarga de imágenes aún está pendiente.
