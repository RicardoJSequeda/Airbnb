/**
 * Estrategia de enrutamiento: URLs y params. Sin validación ni UI.
 */
import type {
  SearchVariant,
  SearchFormState,
  AccommodationState,
  ExperienceState,
  ServicesState,
} from './search.types'

export interface SearchRoutingStrategy {
  buildSearchParams(state: SearchFormState): URLSearchParams
  buildSearchUrl(state: SearchFormState): string
}

function accommodationParams(state: AccommodationState): URLSearchParams {
  const params = new URLSearchParams()
  const dest = state.destination
  const city = dest?.city ?? ''
  if (dest?.isNearby && dest.latitude != null && dest.longitude != null) {
    params.set('lat', String(dest.latitude))
    params.set('lng', String(dest.longitude))
  } else if (city) {
    params.set('city', city)
  }
  if (dest?.region) params.set('region', dest.region)
  if (state.dateRange?.from) {
    params.set('checkIn', state.dateRange.from.toISOString().slice(0, 10))
  }
  if (state.dateRange?.to) {
    params.set('checkOut', state.dateRange.to!.toISOString().slice(0, 10))
  }
  const total =
    state.guests.adults + state.guests.children + state.guests.babies + state.guests.pets || 1
  params.set('guests', String(total))
  return params
}

function experienceParams(state: ExperienceState): URLSearchParams {
  const params = new URLSearchParams()
  const dest = state.destination
  if (dest?.city) params.set('city', dest.city)
  if (dest?.region) params.set('country', dest.region)
  const ed = state.experienceDate
  if (ed?.type) params.set('dateType', ed.type)
  if (ed?.date) params.set('date', ed.date.toISOString().slice(0, 10))
  if (ed?.time) params.set('time', ed.time ?? '')
  const p = state.participants
  if (p.adults) params.set('adults', String(p.adults))
  if (p.children) params.set('children', String(p.children))
  if (p.babies) params.set('babies', String(p.babies))
  return params
}

function servicesParams(state: ServicesState): URLSearchParams {
  const params = new URLSearchParams()
  const dest = state.destination
  if (dest?.city) params.set('city', dest.city)
  if (dest?.region) params.set('region', dest.region)
  return params
}

export const searchRoutingStrategies: Record<SearchVariant, SearchRoutingStrategy> = {
  accommodation: {
    buildSearchParams(state) {
      if (state.variant !== 'accommodation') return new URLSearchParams()
      return accommodationParams(state)
    },
    buildSearchUrl(state) {
      return `/search?${this.buildSearchParams(state).toString()}`
    },
  },
  experience: {
    buildSearchParams(state) {
      if (state.variant !== 'experience') return new URLSearchParams()
      return experienceParams(state)
    },
    buildSearchUrl(state) {
      return `/experiences/search?${this.buildSearchParams(state).toString()}`
    },
  },
  services: {
    buildSearchParams(state) {
      if (state.variant !== 'services') return new URLSearchParams()
      return servicesParams(state)
    },
    buildSearchUrl(state) {
      return `/services/search?${this.buildSearchParams(state).toString()}`
    },
  },
}
