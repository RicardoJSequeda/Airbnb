# Iconos del modal «¿Qué te gustaría compartir?»

Coloca aquí las imágenes de los tres iconos para que el modal las use.

## Formato recomendado: **AVIF**

Buena calidad y poco peso. El código espera por defecto estos nombres:

| Archivo | Opción   |
|---------|----------|
| `share-alojamiento.avif` | Alojamiento (casa) |
| `share-experiencia.avif` | Experiencia (globo) |
| `share-servicio.avif`    | Servicio (campana) |

## Otros formatos

También puedes usar **PNG**, **WebP** o **SVG**. En ese caso edita las rutas en `apps/web/src/components/shared/ShareHostModal.tsx` (constante `ICON_IMAGES`) y cambia la extensión `.avif` por la que uses.

Si no existen estos archivos, el modal muestra iconos por defecto (Lucide).
