/**
 * Sistema de configuración modular para el buscador
 * Permite que cada sección (Alojamientos, Experiencias, Servicios) tenga su propia configuración
 */

export type SearchSection = 'accommodations' | 'experiences' | 'services'

export interface SearchFieldConfig {
  id: string
  label: string
  placeholder: string
  component: 'destination' | 'dates' | 'guests' | 'participants' | 'time' | 'custom'
  required?: boolean
}

export interface SearchConfig {
  section: SearchSection
  fields: SearchFieldConfig[]
  searchRoute: string
  searchParamsBuilder: (values: Record<string, any>) => URLSearchParams
}

/** Configuración para Alojamientos */
export const accommodationsSearchConfig: SearchConfig = {
  section: 'accommodations',
  fields: [
    {
      id: 'destination',
      label: 'Dónde',
      placeholder: '¿A dónde vas?',
      component: 'destination',
      required: true,
    },
    {
      id: 'dates',
      label: 'Cuándo',
      placeholder: 'Agrega fechas',
      component: 'dates',
    },
    {
      id: 'guests',
      label: 'Quién',
      placeholder: '¿Cuántos?',
      component: 'guests',
    },
  ],
  searchRoute: '/search',
  searchParamsBuilder: (values) => {
    const params = new URLSearchParams()
    if (values.destination?.city) params.set('city', values.destination.city)
    if (values.destination?.latitude && values.destination?.longitude) {
      params.set('lat', String(values.destination.latitude))
      params.set('lng', String(values.destination.longitude))
    }
    if (values.checkIn) params.set('checkIn', values.checkIn)
    if (values.checkOut) params.set('checkOut', values.checkOut)
    params.set('guests', String(values.guests?.total || 1))
    return params
  },
}

/** Configuración para Experiencias */
export const experiencesSearchConfig: SearchConfig = {
  section: 'experiences',
  fields: [
    {
      id: 'destination',
      label: 'Dónde',
      placeholder: 'Busca por ciudad o interés',
      component: 'destination',
      required: true,
    },
    {
      id: 'dates',
      label: 'Fechas',
      placeholder: 'Agrega fechas',
      component: 'dates', // Usará componente especializado para experiencias
    },
    {
      id: 'participants',
      label: 'Quién',
      placeholder: '¿Cuántos?',
      component: 'participants', // Adultos, Niños, Bebés
    },
  ],
  searchRoute: '/experiences/search',
  searchParamsBuilder: (values) => {
    const params = new URLSearchParams()
    if (values.destination?.city) params.set('city', values.destination.city)
    if (values.dateType) params.set('dateType', values.dateType) // 'today', 'tomorrow', 'weekend', 'specific'
    if (values.date) params.set('date', values.date)
    if (values.time) params.set('time', values.time)
    if (values.participants?.adults) params.set('adults', String(values.participants.adults))
    if (values.participants?.children) params.set('children', String(values.participants.children))
    if (values.participants?.babies) params.set('babies', String(values.participants.babies))
    return params
  },
}

/** Configuración para Servicios (placeholder - se implementará después) */
export const servicesSearchConfig: SearchConfig = {
  section: 'services',
  fields: [
    {
      id: 'destination',
      label: 'Dónde',
      placeholder: '¿Dónde necesitas el servicio?',
      component: 'destination',
      required: true,
    },
    {
      id: 'serviceType',
      label: 'Tipo',
      placeholder: 'Tipo de servicio',
      component: 'custom',
    },
    {
      id: 'dates',
      label: 'Cuándo',
      placeholder: 'Agrega fechas',
      component: 'dates',
    },
  ],
  searchRoute: '/services/search',
  searchParamsBuilder: (values) => {
    const params = new URLSearchParams()
    if (values.destination?.city) params.set('city', values.destination.city)
    if (values.serviceType) params.set('serviceType', values.serviceType)
    if (values.date) params.set('date', values.date)
    return params
  },
}

/** Mapa de configuraciones por sección */
export const searchConfigs: Record<SearchSection, SearchConfig> = {
  accommodations: accommodationsSearchConfig,
  experiences: experiencesSearchConfig,
  services: servicesSearchConfig,
}

/** Obtener configuración por sección */
export function getSearchConfig(section: SearchSection): SearchConfig {
  return searchConfigs[section] || accommodationsSearchConfig
}

/** Detectar sección desde la ruta */
export function detectSearchSection(pathname: string): SearchSection {
  if (pathname.startsWith('/experiences')) return 'experiences'
  if (pathname.startsWith('/services')) return 'services'
  return 'accommodations'
}
