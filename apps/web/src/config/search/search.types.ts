/**
 * Tipado del dominio de búsqueda. Estado como discriminated union por variante.
 */

export type SearchVariant = 'accommodation' | 'experience' | 'services'

export interface Destination {
  id?: string
  name: string
  city: string
  region: string
  isNearby?: boolean
  latitude?: number
  longitude?: number
}

export type DateRangeValue = { from?: Date; to?: Date } | undefined

export interface GuestsValue {
  adults: number
  children: number
  babies: number
  pets: number
}

export interface ParticipantsValue {
  adults: number
  children: number
  babies: number
}

export interface ExperienceDateValue {
  type: 'today' | 'tomorrow' | 'weekend' | 'specific'
  date?: Date
  time?: string
}

export interface AccommodationState {
  variant: 'accommodation'
  destination: Destination | null
  dateRange: DateRangeValue
  guests: GuestsValue
}

export interface ExperienceState {
  variant: 'experience'
  destination: Destination | null
  experienceDate: ExperienceDateValue | null
  participants: ParticipantsValue
}

export interface ServicesState {
  variant: 'services'
  destination: Destination | null
}

export type SearchFormState = AccommodationState | ExperienceState | ServicesState

export type DateMode = 'range' | 'single' | null
export type GuestsMode = 'accommodation' | 'participants' | null

/** Tipo de opción rápida de fecha (preset) */
export type DatePresetId = 'today' | 'tomorrow' | 'weekend' | 'specific'

/** Una opción del panel izquierdo: label principal + sub (ej. "Hoy" / "18 feb") */
export interface DatePresetOption {
  id: DatePresetId
  mainLabel: string
  getSubLabel(referenceDate: Date): string
  resolveDate(referenceDate: Date): Date
}

/** Configuración de la sección fechas/hora; solo para variantes con dateMode 'single' y presets */
export interface SearchDateAndTimeConfig {
  showTimeSelection: boolean
  panelTitle: string
  specificDatePanelTitle: string
  timePanelTitle: string
  presets: DatePresetOption[]
  timeSlots: string[]
}

export interface SearchStrategyComponents {
  showDates: boolean
  showGuests: boolean
  dateMode: DateMode
  guestsMode: GuestsMode
  locationPlaceholder: string
  datesSectionLabel: string
  guestsSectionLabel: string
  /** Solo definido cuando la variante tiene presets + calendario + hora (ej. experiencias) */
  dateAndTime?: SearchDateAndTimeConfig
}

export interface ValidationResult {
  valid: boolean
  errors?: Record<string, string>
}

/** Actualizaciones parciales del formulario; la strategy aplica según variante */
export type SearchStateUpdate =
  | { field: 'destination'; value: Destination | null }
  | { field: 'dateRange'; value: DateRangeValue }
  | { field: 'experienceDate'; value: ExperienceDateValue | null }
  | { field: 'guests'; value: GuestsValue }
  | { field: 'participants'; value: ParticipantsValue }

/** Paso actual del flujo UI (máquina de estados) */
export type SearchUIStep = 'idle' | 'location' | 'dates' | 'guests'

export type SearchUIState = {
  step: SearchUIStep
  showNeighborhoods: boolean
  placesData: unknown
  geoError: string | null
}
