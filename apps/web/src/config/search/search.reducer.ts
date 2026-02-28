/**
 * Máquina de estados del buscador: flujo UI + formulario. Sin estados imposibles.
 */
import type { CityPlacesResponse } from '@/lib/api/locations'
import type { SearchFormState, SearchStateUpdate, SearchUIStep } from './search.types'
import type { SearchVariantStrategy } from './search.strategies'

export type SearchReducerState = {
  step: SearchUIStep
  form: SearchFormState
  showNeighborhoods: boolean
  placesData: CityPlacesResponse | null
  geoError: string | null
}

export type SearchAction =
  | { type: 'OPEN_SECTION'; section: 'location' | 'dates' | 'guests' }
  | { type: 'CLOSE' }
  | { type: 'FORM_UPDATE'; update: SearchStateUpdate }
  | { type: 'SET_PLACES_DATA'; data: CityPlacesResponse | null }
  | { type: 'SET_GEO_ERROR'; error: string | null }
  | { type: 'SET_SHOW_NEIGHBORHOODS'; value: boolean }

export function createInitialSearchState(strategy: SearchVariantStrategy): SearchReducerState {
  return {
    step: 'idle',
    form: strategy.createInitialState(),
    showNeighborhoods: false,
    placesData: null,
    geoError: null,
  }
}

export function createSearchReducer(strategy: SearchVariantStrategy) {
  return function searchReducer(
    state: SearchReducerState,
    action: SearchAction
  ): SearchReducerState {
    switch (action.type) {
      case 'OPEN_SECTION':
        return { ...state, step: action.section }
      case 'CLOSE':
        return { ...state, step: 'idle' }
      case 'FORM_UPDATE':
        return { ...state, form: strategy.updateState(state.form, action.update) }
      case 'SET_PLACES_DATA':
        return { ...state, placesData: action.data }
      case 'SET_GEO_ERROR':
        return { ...state, geoError: action.error }
      case 'SET_SHOW_NEIGHBORHOODS':
        return { ...state, showNeighborhoods: action.value }
      default:
        return state
    }
  }
}
