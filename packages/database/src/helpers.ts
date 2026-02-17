/**
 * Helpers para manejar arrays en SQLite (se guardan como JSON strings)
 */

export function serializeArray(arr: string[]): string {
  return JSON.stringify(arr);
}

export function deserializeArray(str: string): string[] {
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

/**
 * Ejemplo de uso:
 * 
 * // Al guardar en la DB
 * const property = await prisma.property.create({
 *   data: {
 *     amenities: serializeArray(['WiFi', 'Pool', 'Gym']),
 *     images: serializeArray(['img1.jpg', 'img2.jpg'])
 *   }
 * });
 * 
 * // Al leer de la DB
 * const amenities = deserializeArray(property.amenities);
 * const images = deserializeArray(property.images);
 */