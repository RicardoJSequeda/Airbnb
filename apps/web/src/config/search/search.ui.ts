/**
 * Estrategia de UI: labels, componentes, getters de estado para render sin conocer dominio.
 */
import { format, addDays, startOfDay, startOfWeek, endOfWeek } from 'date-fns'
import { es as dateFnsEs } from 'date-fns/locale'
import type {
  SearchVariant,
  SearchFormState,
  SearchStrategyComponents,
  SearchDateAndTimeConfig,
  DatePresetOption,
  Destination,
  DateRangeValue,
  ExperienceDateValue,
  GuestsValue,
  ParticipantsValue,
} from './search.types'

function createExperienceDateAndTimeConfig(): SearchDateAndTimeConfig {
  const presets: DatePresetOption[] = [
    {
      id: 'today',
      mainLabel: 'Hoy',
      getSubLabel: (ref) => format(startOfDay(ref), 'd MMM', { locale: dateFnsEs }),
      resolveDate: (ref) => startOfDay(ref),
    },
    {
      id: 'tomorrow',
      mainLabel: 'Mañana',
      getSubLabel: (ref) => format(addDays(startOfDay(ref), 1), 'd MMM', { locale: dateFnsEs }),
      resolveDate: (ref) => addDays(startOfDay(ref), 1),
    },
    {
      id: 'weekend',
      mainLabel: 'Este fin de semana',
      getSubLabel: (ref) => {
        const friday = startOfWeek(addDays(ref, 1), { weekStartsOn: 5 })
        const sunday = addDays(friday, 2)
        return `${format(friday, 'd')}-${format(sunday, 'd')} de ${format(sunday, 'MMM', { locale: dateFnsEs })}`
      },
      resolveDate: (ref) => startOfWeek(addDays(ref, 1), { weekStartsOn: 5 }),
    },
  ]
  const timeSlots = ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00']
  return {
    showTimeSelection: false,
    panelTitle: 'Selecciona una fecha',
    specificDatePanelTitle: '',
    timePanelTitle: 'Selecciona una hora',
    presets,
    timeSlots,
  }
}

export interface SearchUIStrategy {
  components: SearchStrategyComponents
  getDatesLabel(state: SearchFormState): string
  getGuestsLabel(state: SearchFormState): string
  getEmptyGuestsSection(): GuestsValue | ParticipantsValue
  getDestination(state: SearchFormState): Destination | null
  getDateRange(state: SearchFormState): DateRangeValue | undefined
  getExperienceDate(state: SearchFormState): ExperienceDateValue | null | undefined
  getGuests(state: SearchFormState): GuestsValue | undefined
  getParticipants(state: SearchFormState): ParticipantsValue | undefined
}

const accommodationUI: SearchUIStrategy = {
  components: {
    showDates: true,
    showGuests: true,
    dateMode: 'range',
    guestsMode: 'accommodation',
    locationPlaceholder: '¿A dónde vas?',
    datesSectionLabel: 'Cuándo',
    guestsSectionLabel: 'Quién',
  },
  getDatesLabel(state) {
    if (state.variant !== 'accommodation') return 'Agrega fechas'
    const range = state.dateRange
    if (range?.from && range?.to) {
      return `${format(range.from, 'd MMM', { locale: dateFnsEs })} - ${format(range.to, 'd MMM', { locale: dateFnsEs })}`
    }
    if (range?.from) return format(range.from, 'd MMM', { locale: dateFnsEs })
    return 'Agrega fechas'
  },
  getGuestsLabel(state) {
    if (state.variant !== 'accommodation') return '¿Cuántos?'
    const t = state.guests.adults + state.guests.children + state.guests.babies + state.guests.pets
    if (t === 0) return '¿Cuántos?'
    return t === 1 ? '1 huésped' : `${t} huéspedes`
  },
  getEmptyGuestsSection(): GuestsValue {
    return { adults: 0, children: 0, babies: 0, pets: 0 }
  },
  getDestination(s) {
    return s.destination ?? null
  },
  getDateRange(s) {
    return s.variant === 'accommodation' ? s.dateRange : undefined
  },
  getExperienceDate() {
    return undefined
  },
  getGuests(s) {
    return s.variant === 'accommodation' ? s.guests : undefined
  },
  getParticipants() {
    return undefined
  },
}

const experienceUI: SearchUIStrategy = {
  components: {
    showDates: true,
    showGuests: true,
    dateMode: 'single',
    guestsMode: 'participants',
    locationPlaceholder: 'Busca por ciudad o interés',
    datesSectionLabel: 'Fechas',
    guestsSectionLabel: 'Quién',
    dateAndTime: createExperienceDateAndTimeConfig(),
  },
  getDatesLabel(state) {
    if (state.variant !== 'experience') return 'Agrega fechas'
    const ed = state.experienceDate
    if (!ed) return 'Agrega fechas'
    if (ed.type === 'today') return 'Hoy'
    if (ed.type === 'tomorrow') return 'Mañana'
    if (ed.type === 'weekend') return 'Este fin de semana'
    return ed.date?.toLocaleDateString('es-ES') ?? 'Agrega fechas'
  },
  getGuestsLabel(state) {
    if (state.variant !== 'experience') return '¿Cuántos?'
    const t = state.participants.adults + state.participants.children + state.participants.babies
    if (t === 0) return '¿Cuántos?'
    return t === 1 ? '1 participante' : `${t} participantes`
  },
  getEmptyGuestsSection(): ParticipantsValue {
    return { adults: 0, children: 0, babies: 0 }
  },
  getDestination(s) {
    return s.destination ?? null
  },
  getDateRange() {
    return undefined
  },
  getExperienceDate(s) {
    return s.variant === 'experience' ? s.experienceDate ?? null : undefined
  },
  getGuests() {
    return undefined
  },
  getParticipants(s) {
    return s.variant === 'experience' ? s.participants : undefined
  },
}

const servicesUI: SearchUIStrategy = {
  components: {
    showDates: false,
    showGuests: false,
    dateMode: null,
    guestsMode: null,
    locationPlaceholder: '¿Qué servicio buscas?',
    datesSectionLabel: 'Cuándo',
    guestsSectionLabel: 'Quién',
  },
  getDatesLabel() {
    return ''
  },
  getGuestsLabel() {
    return ''
  },
  getEmptyGuestsSection(): ParticipantsValue {
    return { adults: 0, children: 0, babies: 0 }
  },
  getDestination(s) {
    return s.destination ?? null
  },
  getDateRange() {
    return undefined
  },
  getExperienceDate() {
    return undefined
  },
  getGuests() {
    return undefined
  },
  getParticipants() {
    return undefined
  },
}

export const searchUIStrategies: Record<SearchVariant, SearchUIStrategy> = {
  accommodation: accommodationUI,
  experience: experienceUI,
  services: servicesUI,
}
