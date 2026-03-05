# Análisis del módulo de perfil

Documento de análisis del módulo de perfil: arquitectura, estructura, patrones de diseño, estado y diseño visual.

---

## 1. Arquitectura y estructura de carpetas

```
apps/web/src/
├── app/profile/                    # Rutas del módulo (App Router)
│   ├── page.tsx                    # Vista principal: Información sobre mí
│   ├── edit/page.tsx              # Editar perfil (placeholder)
│   ├── trips/page.tsx             # Viajes anteriores (placeholder)
│   ├── connections/page.tsx       # Conexiones (placeholder)
│   └── README.md                  # Este análisis
│
└── components/profile/            # Componentes reutilizables del perfil
    ├── index.ts                   # Barrel: exporta los 4 componentes
    ├── ProfileSidebar.tsx         # Navegación lateral
    ├── UserInfoCard.tsx           # Tarjeta de usuario (avatar, nombre, rol)
    ├── CompleteProfilePrompt.tsx  # Tarjeta "Completa tu perfil" + CTA
    └── UserReviewsLink.tsx        # Enlace a reseñas escritas
```

- **Rutas**: Next.js App Router; cada sección es una ruta (`/profile`, `/profile/edit`, `/profile/trips`, `/profile/connections`).
- **Componentes**: Carpeta `components/profile/` con barrel en `index.ts` para imports desde `@/components/profile`.
- **Separación**: Páginas solo orquestan layout y datos; la UI vive en componentes reutilizables.

---

## 2. Rutas y páginas

| Ruta | Archivo | Contenido | Protección |
|------|---------|-----------|------------|
| `/profile` | `app/profile/page.tsx` | Información sobre mí: UserInfoCard, CompleteProfilePrompt, UserReviewsLink | Auth + redirect a login |
| `/profile/edit` | `app/profile/edit/page.tsx` | Editar perfil (placeholder) | Auth |
| `/profile/trips` | `app/profile/trips/page.tsx` | Viajes anteriores (placeholder) | Auth |
| `/profile/connections` | `app/profile/connections/page.tsx` | Conexiones (placeholder) | Auth |

- Todas son **client components** (`'use client'`).
- **Protección**: `useEffect` + `useAuthStore` + `useLoginModalStore.open(redirectPath)`. Si no hay sesión, se abre el modal de login con redirect a la ruta actual.
- **Estado de carga**: Mientras `!isAuthenticated` se muestra "Cargando..." con Header + Footer.
- **Layout común**: Header → main (contenido) → Footer; dentro del main, contenedor `max-w-[1200px]` y dos columnas (sidebar + contenido).

---

## 3. Componentes del módulo

### 3.1 ProfileSidebar

- **Responsabilidad**: Navegación lateral del perfil (título "Perfil" + 3 enlaces).
- **Props**: `title?`, `items?` (array de `ProfileNavItem`: label, href, icon).
- **Estado activo**: Con `usePathname()`; activo si `pathname === item.href` o (para subrutas) `pathname.startsWith(item.href)` cuando `item.href !== '/profile'`.
- **Diseño**: Título `text-2xl font-bold`; ítems con ícono (lucide-react) + texto; activo con `bg-gray-100`, `font-medium` y sombra sutil; separador vertical en desktop (`lg:border-r`).
- **Reutilización**: Usado en las 4 páginas del perfil; se puede extender con más ítems vía `items`.

### 3.2 UserInfoCard

- **Responsabilidad**: Mostrar avatar, nombre y rol del usuario en una tarjeta.
- **Props**: `user` (Pick<User, 'name' | 'avatar' | 'role'>), `roleLabel?`, `className?`.
- **Datos**: Rol traducido con `roleLabels` (GUEST → Huésped, HOST → Anfitrión, ADMIN → Administrador). Sin avatar: círculo con gradiente + inicial.
- **Diseño**: Tarjeta blanca, `rounded-2xl`, borde gris, sombra `shadow-[0_2px_8px_rgba(0,0,0,0.06)]`; contenido centrado (avatar 24×24, nombre `text-xl font-bold`, rol `text-sm text-gray-600`).

### 3.3 CompleteProfilePrompt

- **Responsabilidad**: Bloque "Completa tu perfil" con título, descripción y CTA.
- **Props**: `title`, `description`, `ctaLabel`, `ctaHref`, `onCtaClick?`, `className?`. CTA puede ser Link o button según `onCtaClick`.
- **Defaults**: Textos fijos en español; `ctaHref = '/profile/edit'`.
- **Diseño**: Misma tarjeta que UserInfoCard (rounded-2xl, borde, misma sombra); título centrado; descripción `text-left`; botón "Comencemos" centrado y primario (rosa).

### 3.4 UserReviewsLink

- **Responsabilidad**: Enlace con ícono a la lista de reseñas del usuario.
- **Props**: `href?`, `label?`, `className?`. Por defecto `href = '/profile/reviews'`; en la página principal de perfil se pasa `href="/my-reviews"`.
- **Diseño**: Ícono MessageSquare + texto `text-[15px] font-normal`, hover underline.

---

## 4. Patrón de diseño (UI/UX)

### 4.1 Layout

- **Dashboard de dos columnas**: Sidebar fija (max 240px) + área de contenido flexible.
- **Responsive**: En móvil columnas apiladas (`flex-col`); en `lg` en fila (`lg:flex-row`). Mismos gaps (`gap-10 lg:gap-16`) y padding del contenedor (`px-6 md:px-10 lg:px-12`).
- **Contenedor**: `max-w-[1200px] mx-auto` para centrar y limitar ancho.

### 4.2 Tarjetas

- **Estilo unificado**: `bg-white rounded-2xl border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)]`.
- UserInfoCard y CompleteProfilePrompt comparten este criterio para coherencia visual.

### 4.3 Navegación

- **Sidebar**: Lista vertical; ítem activo con fondo gris y sombra ligera; íconos + texto; transiciones suaves.
- **Enlaces**: Next.js `Link` para navegación client-side sin recarga.

### 4.4 Jerarquía tipográfica

- Títulos de página/sección: `text-2xl font-bold text-[#222222]`.
- Títulos de card: `text-lg font-bold text-[#222222]`.
- Nombre de usuario: `text-xl font-bold`.
- Texto secundario / rol: `text-sm text-gray-600`.
- Navegación y enlaces: `text-[15px]`, `font-medium` en activo, `font-normal` en inactivo.
- Botón "Editar": `text-sm font-normal`, borde y fondo gris.

### 4.5 Accesibilidad y semántica

- Navegación en `<nav>`, título de sección en `<h1>` en sidebar y `<h2>` en contenido.
- UserInfoCard: nombre en `<h2>`, rol en `<p>`.
- Enlaces y botones con estilos de hover/transición.

---

## 5. Estado y autenticación

- **Fuente de verdad**: Zustand con persist (`useAuthStore`): `user`, `token`, `isAuthenticated`, `setAuth`, `logout`. Persistencia en `localStorage` bajo la key `auth-storage`.
- **Tipo User** (`@/types`): `id`, `email`, `name`, `role`, `avatar?`, etc.
- **Protección de rutas**: En cada página, `useEffect` que llama a `openLoginModal(redirectPath)` si `!isAuthenticated`. No hay HOC ni middleware; la redirección tras login depende del modal/store de login.
- **Header**: En rutas de perfil (y otras de cuenta) se usa el "header minimalista" (sin buscador ni pestañas); el avatar del header enlaza a `/profile` y el menú desplegable incluye el enlace "Perfil".

---

## 6. Integración con el resto de la app

- **Header** (`components/layout/header.tsx`): Detecta rutas de perfil/cuenta con `isMinimalHeaderPage()` y muestra header sin buscador ni Alojamientos/Experiencias/Servicios; enlace "Perfil" en el menú y avatar → `/profile`.
- **Footer**: Todas las páginas de perfil incluyen el Footer global.
- **Enlaces cruzados**: "Editar" → `/profile/edit`; "Comencemos" → `/profile/edit`; "Reseñas escritas por mí" → `/my-reviews` (no `/profile/reviews` en la página principal para reutilizar la vista existente).
- **Tipos**: User y tipos relacionados en `@/types`; componentes usan `Pick<User, …>` donde basta.

---

## 7. Resumen de aspectos por categoría

| Aspecto | Estado |
|---------|--------|
| **Arquitectura** | App Router + componentes en carpeta dedicada; barrel para imports. |
| **Estructura** | 4 rutas bajo `/profile`; 4 componentes reutilizables. |
| **Patrón de diseño** | Dos columnas, tarjetas unificadas, jerarquía tipográfica clara. |
| **Diseño visual** | Sombras y bordes consistentes; paleta gris + primario (rosa); centrado y espaciado uniforme. |
| **Autenticación** | Store global; protección por página vía modal de login con redirect. |
| **Reutilización** | Sidebar y componentes de tarjeta/enlace reutilizables y configurables por props. |
| **Placeholders** | Edit, Trips y Connections aún sin contenido real. |

---

## 8. Posibles mejoras

- **Tipografía**: Unificar `font-semibold` en edit/trips/connections a `font-bold` en títulos de sección para igualar la página principal.
- **Layout compartido**: Extraer el layout (Header + main con contenedor + Footer y estructura de columnas) a un `ProfileLayout` o layout de App Router para evitar duplicar el mismo esquema en cada página.
- **Ruta /profile/reviews**: UserReviewsLink por defecto apunta a `/profile/reviews`; la página principal usa `/my-reviews`. Decidir si unificar en una sola ruta o mantener ambas.
- **Carga**: Sustituir "Cargando..." por un skeleton o spinner alineado con el diseño del perfil.
- **Edición**: Implementar formulario en `/profile/edit` y, si aplica, API de actualización de perfil.
