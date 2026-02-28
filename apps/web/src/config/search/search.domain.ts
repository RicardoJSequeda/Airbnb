/**
 * Estrategia de dominio: estado inicial, actualización, validación, fetch. Sin rutas ni UI.
 */
import type { LocationSuggestion } from '@/lib/api/locations'
import { fetchAccommodationSuggestions } from '@/services/search/accommodation.service'
import { fetchExperienceSuggestions } from '@/services/search/experience.service'
import { fetchServiceSuggestions } from '@/services/search/services.service'
import { validateSearchState } from './search.validation'
import type {
  SearchVariant,
  SearchFormState,
  AccommodationState,
  ExperienceState,
  ServicesState,
  SearchStateUpdate,
  ValidationResult,
  GuestsValue,
  ParticipantsValue,
} from './search.types'

export interface SearchDomainStrategy {
  createInitialState(): SearchFormState
  updateState(state: SearchFormState, update: SearchStateUpdate): SearchFormState
  validate(state: SearchFormState): ValidationResult
  fetchSuggestions(query?: string): Promise<LocationSuggestion[]>
}

function accommodationUpdate(
  state: AccommodationState,
  update: SearchStateUpdate
): AccommodationState {
  switch (update.field) {
    case 'destination':
      return { ...state, destination: update.value }
    case 'dateRange':
      return { ...state, dateRange: update.value }
    case 'guests':
      return { ...state, guests: update.value }
    default:
      return state
  }
}

function experienceUpdate(
  state: ExperienceState,
  update: SearchStateUpdate
): ExperienceState {
  switch (update.field) {
    case 'destination':
      return { ...state, destination: update.value }
    case 'experienceDate':
      return { ...state, experienceDate: update.value }
    case 'participants':
      return { ...state, participants: update.value }
    default:
      return state
  }
}

function servicesUpdate(state: ServicesState, update: SearchStateUpdate): ServicesState {
  if (update.field === 'destination') {
    return { ...state, destination: update.value }
  }
  return state
}

const accommodationDomain: SearchDomainStrategy = {
  createInitialState(): AccommodationState {
    return {
      variant: 'accommodation',
      destination: null,
      dateRange: undefined,
      guests: { adults: 0, children: 0, babies: 0, pets: 0 },
    }
  },
  updateState(state, update) {
    if (state.variant !== 'accommodation') return state
    return accommodationUpdate(state, update)
  },
  validate: validateSearchState,
  fetchSuggestions: fetchAccommodationSuggestions,
}

const experienceDomain: SearchDomainStrategy = {
  createInitialState(): ExperienceState {
    return {
      variant: 'experience',
      destination: null,
      experienceDate: null,
      participants: { adults: 0, children: 0, babies: 0 },
    }
  },
  updateState(state, update) {
    if (state.variant !== 'experience') return state
    return experienceUpdate(state, update)
  },
  validate: validateSearchState,
  fetchSuggestions: fetchExperienceSuggestions,
}

const servicesDomain: SearchDomainStrategy = {
  createInitialState(): ServicesState {
    return { variant: 'services', destination: null }
  },
  updateState(state, update) {
    if (state.variant !== 'services') return state
    return servicesUpdate(state, update)
  },
  validate: validateSearchState,
  fetchSuggestions: fetchServiceSuggestions,
}

export const searchDomainStrategies: Record<SearchVariant, SearchDomainStrategy> = {
  accommodation: accommodationDomain,
  experience: experienceDomain,
  services: servicesDomain,
}
