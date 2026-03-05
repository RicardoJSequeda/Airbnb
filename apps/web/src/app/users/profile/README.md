# Módulo de perfil (layout anidado)

Estructura tipo Airbnb con **layout anidado** en App Router: Header, Footer y Sidebar se renderizan una sola vez; solo el panel derecho (`children`) cambia al navegar.

## Estructura

```
app/users/profile/
├── layout.tsx          # Header + Footer + Sidebar + {children} (protección de ruta)
├── page.tsx            # Redirige a /users/profile/about
├── about/page.tsx      # Información sobre mí
├── trips/page.tsx      # Viajes anteriores
├── connections/page.tsx # Conexiones
└── edit/page.tsx       # Editar perfil
```

- **layout.tsx**: Client component. Comprueba autenticación; si no hay sesión abre el modal de login con redirect a la ruta actual. Si hay sesión, renderiza Header, main (max-w-[1200px], flex gap-12), ProfileSidebar a la izquierda y columna derecha (flex-1 min-w-0 max-w-[640px]) con `{children}`. Footer al final.
- **Páginas hijas**: Solo el contenido del panel derecho; sin Header, Footer ni Sidebar.
- **Rutas legacy**: `/profile`, `/profile/edit`, `/profile/trips`, `/profile/connections` redirigen a las nuevas rutas bajo `/users/profile/*`.

## Rutas

| Ruta | Contenido |
|------|-----------|
| `/users/profile` | Redirect → `/users/profile/about` |
| `/users/profile/about` | Información sobre mí (UserInfoCard, CompleteProfilePrompt, UserReviewsLink) |
| `/users/profile/trips` | Viajes anteriores |
| `/users/profile/connections` | Conexiones |
| `/users/profile/edit` | Editar perfil |

## Componentes

- **ProfileSidebar**: Navegación con rutas `/users/profile/about`, `trips`, `connections`. Ítem activo: `bg-neutral-100 rounded-xl` (sin sombra). Título `font-semibold`.
- **UserInfoCard**, **CompleteProfilePrompt**, **UserReviewsLink**: En `@/components/profile`. Sombras ligeras (`shadow-sm`), títulos `font-semibold`, sin `justify-center` en el panel derecho.

## Diseño

- Contenedor principal: `max-w-[1200px] mx-auto`, `gap-12`.
- Panel derecho: `max-w-[640px]`.
- Header minimalista en todas las rutas bajo `/users/profile` (sin buscador ni pestañas).
