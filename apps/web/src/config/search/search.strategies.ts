/**
 * Estrategia compuesta: Routing + UI + Domain. SearchBar solo usa esta fachada.
 */
import type { LocationSuggestion } from '@/lib/api/locations'
import type {
  SearchVariant,
  SearchFormState,
  SearchStrategyComponents,
  SearchStateUpdate,
  ValidationResult,
  Destination,
  DateRangeValue,
  ExperienceDateValue,
  GuestsValue,
  ParticipantsValue,
} from './search.types'
import { searchRoutingStrategies } from './search.routing'
import { searchUIStrategies } from './search.ui'
import { searchDomainStrategies } from './search.domain'

export interface SearchVariantStrategy {
  createInitialState(): SearchFormState
  updateState(state: SearchFormState, update: SearchStateUpdate): SearchFormState
  buildSearchParams(state: SearchFormState): URLSearchParams
  buildSearchUrl(state: SearchFormState): string
  fetchSuggestions(query?: string): Promise<LocationSuggestion[]>
  validate(state: SearchFormState): ValidationResult
  getDatesLabel(state: SearchFormState): string
  getGuestsLabel(state: SearchFormState): string
  getEmptyGuestsSection(): GuestsValue | ParticipantsValue
  getDestination(state: SearchFormState): Destination | null
  getDateRange(state: SearchFormState): DateRangeValue | undefined
  getExperienceDate(state: SearchFormState): ExperienceDateValue | null | undefined
  getGuests(state: SearchFormState): GuestsValue | undefined
  getParticipants(state: SearchFormState): ParticipantsValue | undefined
  components: SearchStrategyComponents
}

function composeStrategy(variant: SearchVariant): SearchVariantStrategy {
  const routing = searchRoutingStrategies[variant]
  const ui = searchUIStrategies[variant]
  const domain = searchDomainStrategies[variant]
  return {
    createInitialState: () => domain.createInitialState(),
    updateState: (state, update) => domain.updateState(state, update),
    buildSearchParams: (state) => routing.buildSearchParams(state),
    buildSearchUrl: (state) => routing.buildSearchUrl(state),
    fetchSuggestions: (query) => domain.fetchSuggestions(query),
    validate: (state) => domain.validate(state),
    getDatesLabel: (state) => ui.getDatesLabel(state),
    getGuestsLabel: (state) => ui.getGuestsLabel(state),
    getEmptyGuestsSection: () => ui.getEmptyGuestsSection(),
    getDestination: (state) => ui.getDestination(state),
    getDateRange: (state) => ui.getDateRange(state),
    getExperienceDate: (state) => ui.getExperienceDate(state),
    getGuests: (state) => ui.getGuests(state),
    getParticipants: (state) => ui.getParticipants(state),
    components: ui.components,
  }
}

export const searchStrategies: Record<SearchVariant, SearchVariantStrategy> = {
  accommodation: composeStrategy('accommodation'),
  experience: composeStrategy('experience'),
  services: composeStrategy('services'),
}

export function getVariantFromPathname(pathname: string): SearchVariant {
  if (pathname.startsWith('/experiences')) return 'experience'
  if (pathname.startsWith('/services')) return 'services'
  return 'accommodation'
}

export function buildSearchUrl(state: SearchFormState, variant: SearchVariant): string {
  return searchStrategies[variant].buildSearchUrl(state)
}
