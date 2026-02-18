/** Destinos sugeridos - Córdoba y Antioquia */

export interface Destination {
  name: string
  description: string
  city: string
  region: string
  image?: string
}

export interface Neighborhood {
  name: string
  type: string
}

/** Destinos para el buscador */
export const SUGGESTED_DESTINATIONS: Destination[] = [
  {
    name: 'Medellín, Antioquia',
    description: 'Por lugares emblemáticos como este: Plaza Botero',
    city: 'Medellín',
    region: 'Antioquia',
  },
  {
    name: 'Montería, Córdoba',
    description: 'Descubre qué hay a tu alrededor',
    city: 'Montería',
    region: 'Córdoba',
  },
  {
    name: 'Cartagena, Bolívar',
    description: 'Una destinación de playa popular',
    city: 'Cartagena',
    region: 'Bolívar',
  },
  {
    name: 'Santa Marta, Magdalena',
    description: 'Para los amantes de la naturaleza',
    city: 'Santa Marta',
    region: 'Magdalena',
  },
  {
    name: 'Cali, Valle del Cauca',
    description: 'Popular entre los viajeros de tu zona',
    city: 'Cali',
    region: 'Valle del Cauca',
  },
  {
    name: 'Barranquilla, Atlántico',
    description: 'Popular entre los viajeros de tu zona',
    city: 'Barranquilla',
    region: 'Atlántico',
  },
  {
    name: 'San Andrés',
    description: 'Por su encanto costero',
    city: 'San Andrés',
    region: 'Islas',
  },
  {
    name: 'Ciudad de Panamá, Panamá',
    description: 'Por su diversión nocturna',
    city: 'Ciudad de Panamá',
    region: 'Panamá',
  },
  {
    name: 'Villa de Leyva, Boyacá',
    description: 'Ideal para escapadas de fin de semana',
    city: 'Villa de Leyva',
    region: 'Boyacá',
  },
]

/** Barrios/zonas por ciudad (para dropdown al seleccionar) */
export const NEIGHBORHOODS_BY_CITY: Record<string, Neighborhood[]> = {
  'Medellín': [
    { name: 'Medellín, Antioquia', type: 'Ciudad' },
    { name: 'El Poblado', type: 'Vecindario' },
    { name: 'Laureles - Estadio', type: 'Vecindario' },
    { name: 'Estadio Atanasio Girardot', type: 'Estadio' },
    { name: 'Laureles', type: 'Vecindario' },
    { name: 'Envigado', type: 'Vecindario' },
  ],
  'Montería': [
    { name: 'Montería, Córdoba', type: 'Ciudad' },
    { name: 'Centro', type: 'Vecindario' },
  ],
}
