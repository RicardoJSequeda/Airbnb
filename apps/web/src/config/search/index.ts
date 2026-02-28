export {
  searchStrategies,
  getVariantFromPathname,
  buildSearchUrl,
  type SearchVariantStrategy,
} from './search.strategies'
export type {
  SearchVariant,
  SearchFormState,
  AccommodationState,
  ExperienceState,
  ServicesState,
  Destination,
  DateRangeValue,
  GuestsValue,
  ParticipantsValue,
  ExperienceDateValue,
  SearchStrategyComponents,
  ValidationResult,
  DateMode,
  GuestsMode,
  SearchStateUpdate,
  SearchUIStep,
  SearchUIState,
  DatePresetId,
  DatePresetOption,
  SearchDateAndTimeConfig,
} from './search.types'
export { validateSearchState } from './search.validation'
export {
  createInitialSearchState,
  createSearchReducer,
  type SearchReducerState,
  type SearchAction,
} from './search.reducer'
