'use client'

/**
 * SearchBar: 100% agnóstico. Estado en strategy + reducer; cero conocimiento de dominio.
 */

import { useReducer, useEffect, useMemo, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { locationsApi, type LocationSuggestion } from '@/lib/api/locations'
import { NEIGHBORHOODS_BY_CITY } from '@/lib/constants/destinations'
import {
  searchStrategies,
  getVariantFromPathname,
  createInitialSearchState,
  createSearchReducer,
} from '@/config/search'
import type {
  SearchVariant,
  SearchVariantStrategy,
  SearchReducerState,
  SearchAction,
  GuestsValue,
  ParticipantsValue,
} from '@/config/search'
import { useSearchSuggestions } from './useSearchSuggestions'
import { LocationInput } from './LocationInput'
import { DateInput } from './DateInput'
import { GuestsInput } from './GuestsInput'

const capsuleSpring = { type: 'spring' as const, stiffness: 520, damping: 38, mass: 0.7 }
const panelLayoutSpring = { type: 'spring' as const, stiffness: 350, damping: 32 }
const panelContentTransition = { duration: 0.18, ease: [0.22, 0.61, 0.36, 1] as const }

type ActiveSection = 'destination' | 'dates' | 'guests' | null

function citySlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
}

/** Mapeo section id UI <-> step del reducer */
function sectionToStep(section: ActiveSection): 'idle' | 'location' | 'dates' | 'guests' {
  if (section === null) return 'idle'
  if (section === 'destination') return 'location'
  return section
}
function stepToSection(step: 'idle' | 'location' | 'dates' | 'guests'): ActiveSection {
  if (step === 'idle') return null
  if (step === 'location') return 'destination'
  return step
}

interface SearchBarProps {
  variant: SearchVariant
  initialSection?: ActiveSection
  onClose?: () => void
}

export function SearchBar({ variant, initialSection = null, onClose }: SearchBarProps) {
  const router = useRouter()
  const strategy = searchStrategies[variant]
  const comp = strategy.components
  const { suggestions, loading } = useSearchSuggestions(strategy)

  const reducer = useMemo(() => createSearchReducer(strategy), [strategy])
  const [state, dispatch] = useReducer(
    reducer,
    strategy,
    (s: SearchVariantStrategy) => createInitialSearchState(s)
  ) as [SearchReducerState, React.Dispatch<SearchAction>]

  const activeSection = stepToSection(state.step)

  useEffect(() => {
    if (initialSection != null) {
      dispatch({ type: 'OPEN_SECTION', section: sectionToStep(initialSection) as 'location' | 'dates' | 'guests' })
    }
  }, [initialSection])

  const toggleSection = (section: ActiveSection) => {
    const next = section === activeSection ? 'idle' : sectionToStep(section)
    if (next === 'idle') {
      dispatch({ type: 'CLOSE' })
    } else {
      dispatch({ type: 'OPEN_SECTION', section: next })
    }
  }

  const handleNearby = () => {
    dispatch({ type: 'SET_GEO_ERROR', error: null })
    dispatch({ type: 'SET_SHOW_NEIGHBORHOODS', value: false })
    if (!navigator.geolocation) {
      dispatch({
        type: 'SET_GEO_ERROR',
        error: 'Tu navegador no soporta geolocalización',
      })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        dispatch({
          type: 'FORM_UPDATE',
          update: {
            field: 'destination',
            value: {
              name: 'Cerca',
              city: 'Cerca',
              region: '',
              isNearby: true,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            },
          },
        })
        dispatch({ type: 'SET_GEO_ERROR', error: null })
        if (comp.showDates) dispatch({ type: 'OPEN_SECTION', section: 'dates' })
        else if (comp.showGuests) dispatch({ type: 'OPEN_SECTION', section: 'guests' })
        else dispatch({ type: 'CLOSE' })
      },
      (err) => {
        dispatch({
          type: 'SET_GEO_ERROR',
          error:
            err.code === err.PERMISSION_DENIED
              ? 'Permite el acceso a tu ubicación para ver alojamientos cerca de ti'
              : 'No se pudo obtener tu ubicación. Intenta de nuevo.',
        })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const handleDestinationSelect = (d: LocationSuggestion) => {
    dispatch({
      type: 'FORM_UPDATE',
      update: {
        field: 'destination',
        value: { id: d.id, name: d.name, city: d.city, region: d.region },
      },
    })
    const neighborhoods = NEIGHBORHOODS_BY_CITY[d.city]
    locationsApi
      .getPlacesByCity(citySlug(d.city))
      .then((data) => {
        if (data?.places.length > 1) {
          dispatch({ type: 'SET_PLACES_DATA', data })
          dispatch({ type: 'SET_SHOW_NEIGHBORHOODS', value: true })
        } else {
          dispatch({ type: 'SET_PLACES_DATA', data: null })
          dispatch({ type: 'SET_SHOW_NEIGHBORHOODS', value: !!neighborhoods })
          if (!neighborhoods) {
            if (comp.showDates) dispatch({ type: 'OPEN_SECTION', section: 'dates' })
            else if (comp.showGuests) dispatch({ type: 'OPEN_SECTION', section: 'guests' })
            else dispatch({ type: 'CLOSE' })
          }
        }
      })
      .catch(() => {
        if (neighborhoods) {
          dispatch({
            type: 'SET_PLACES_DATA',
            data: {
              city: { id: '', name: d.city, fullName: d.name, region: d.region },
              places: neighborhoods.map((n, i) => ({
                id: `fallback-${i}`,
                name: n.name,
                type: n.type === 'Estadio' ? 'STADIUM' : 'NEIGHBORHOOD',
                description: n.type,
              })),
            },
          })
          dispatch({ type: 'SET_SHOW_NEIGHBORHOODS', value: true })
        } else {
          dispatch({ type: 'SET_PLACES_DATA', data: null })
          dispatch({ type: 'SET_SHOW_NEIGHBORHOODS', value: false })
          if (comp.showDates) dispatch({ type: 'OPEN_SECTION', section: 'dates' })
          else if (comp.showGuests) dispatch({ type: 'OPEN_SECTION', section: 'guests' })
          else dispatch({ type: 'CLOSE' })
        }
      })
  }

  const handleNeighborhoodSelect = (name: string) => {
    const dest = strategy.getDestination(state.form)
    if (dest) {
      dispatch({
        type: 'FORM_UPDATE',
        update: { field: 'destination', value: { ...dest, name } },
      })
    }
    dispatch({ type: 'SET_SHOW_NEIGHBORHOODS', value: false })
    dispatch({ type: 'SET_PLACES_DATA', data: null })
    if (comp.showDates) dispatch({ type: 'OPEN_SECTION', section: 'dates' })
    else if (comp.showGuests) dispatch({ type: 'OPEN_SECTION', section: 'guests' })
    else dispatch({ type: 'CLOSE' })
  }

  const handleSubmit = () => {
    const { valid } = strategy.validate(state.form)
    if (!valid) return
    const dest = strategy.getDestination(state.form)
    if (dest?.id && /^[0-9a-f-]{36}$/i.test(dest.id)) {
      locationsApi.logSearch(dest.id).catch(() => {})
    }
    router.push(strategy.buildSearchUrl(state.form))
    onClose?.()
  }

  const datesLabel = strategy.getDatesLabel(state.form)
  const guestsLabel = strategy.getGuestsLabel(state.form)
  const guestsValue = comp.guestsMode === 'participants'
    ? strategy.getParticipants(state.form)
    : strategy.getGuests(state.form)
  const guestsCount = guestsValue
    ? guestsValue.adults + guestsValue.children + guestsValue.babies +
      (comp.guestsMode === 'accommodation' ? (guestsValue as GuestsValue).pets : 0)
    : 0

  const handleClearGuests = () => {
    const empty = strategy.getEmptyGuestsSection()
    if (comp.guestsMode === 'accommodation') {
      dispatch({ type: 'FORM_UPDATE', update: { field: 'guests', value: empty as GuestsValue } })
    } else {
      dispatch({ type: 'FORM_UPDATE', update: { field: 'participants', value: empty as ParticipantsValue } })
    }
  }

  const destination = strategy.getDestination(state.form)

  const sections: { id: ActiveSection; label: string; sublabel: React.ReactNode }[] = [
    {
      id: 'destination',
      label: 'Dónde',
      sublabel: destination ? (
        <>
          <span>{destination.name}</span>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              dispatch({ type: 'FORM_UPDATE', update: { field: 'destination', value: null } })
              dispatch({ type: 'SET_GEO_ERROR', error: null })
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                dispatch({ type: 'FORM_UPDATE', update: { field: 'destination', value: null } })
              }
            }}
            className="p-0.5 hover:bg-gray-200 rounded-full cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </span>
        </>
      ) : (
        comp.locationPlaceholder
      ),
    },
  ]
  if (comp.showDates) {
    sections.push({ id: 'dates', label: comp.datesSectionLabel, sublabel: datesLabel })
  }
  if (comp.showGuests) {
    sections.push({
      id: 'guests',
      label: comp.guestsSectionLabel,
      sublabel: (
        <>
          {guestsLabel}
          {guestsCount > 0 && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                handleClearGuests()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleClearGuests()
                }
              }}
              className="p-0.5 hover:bg-gray-200 rounded-full cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
        </>
      ),
    })
  }

  const panelJustify =
    activeSection === 'destination' ? 'flex-start' : activeSection === 'dates' ? 'center' : 'flex-end'
  const panelWidth =
    activeSection === 'destination' ? 425 : activeSection === 'dates' ? 'min(90vw, 850px)' : 400

  const mobileSectionTitle =
    activeSection === 'destination'
      ? 'Dónde'
      : activeSection === 'dates'
        ? comp.datesSectionLabel
        : activeSection === 'guests'
          ? comp.guestsSectionLabel
          : ''

  const closePanel = () => dispatch({ type: 'CLOSE' })

  return (
    <div className="relative flex items-center justify-center h-16 w-full pb-4 max-w-[850px] mx-auto">
      <div className="relative z-50 w-full">
        <motion.div
          layout
          className={`flex items-center w-full border border-gray-300 rounded-full shadow-lg ${
            activeSection ? 'bg-[#EBEBEB]' : 'bg-white'
          }`}
        >
          <LayoutGroup>
            {sections.map(({ id, label, sublabel }, index) => (
              <Fragment key={id}>
                {index > 0 && (
                  <div
                    className={`h-8 w-px shrink-0 ${activeSection ? 'bg-transparent' : 'bg-gray-300'}`}
                  />
                )}
                <div className="flex-1 relative min-w-0">
                  {activeSection === id && (
                    <motion.div
                      layoutId="search-pill"
                      transition={capsuleSpring}
                      className="absolute inset-0 bg-white rounded-full shadow-xl"
                      style={{ margin: 4 }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (id === 'destination') {
                        dispatch({ type: 'SET_SHOW_NEIGHBORHOODS', value: false })
                        dispatch({ type: 'SET_GEO_ERROR', error: null })
                      }
                      toggleSection(id)
                    }}
                    className="relative z-10 w-full py-3 px-6 text-left rounded-full transition-colors"
                  >
                    <div className="text-xs font-semibold text-secondary">{label}</div>
                    <div className="text-sm text-gray-600 truncate flex items-center gap-1">
                      {sublabel}
                    </div>
                  </button>
                </div>
              </Fragment>
            ))}
          </LayoutGroup>
          <button
            type="button"
            onClick={handleSubmit}
            className="relative z-10 m-2 p-3 bg-primary hover:bg-primary/90 text-white rounded-full transition-colors flex items-center gap-2 shrink-0"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline text-sm font-semibold">Buscar</span>
          </button>
        </motion.div>

        {activeSection && (
          <div
            className="hidden md:flex absolute top-full left-0 right-0 mt-2 z-50 min-h-[320px]"
            style={{ justifyContent: panelJustify }}
          >
            <motion.div
              layout
              transition={panelLayoutSpring}
              className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
              style={{ width: panelWidth }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {activeSection === 'destination' && (
                  <motion.div key="destination" transition={panelContentTransition}>
                    <LocationInput
                      placeholder={comp.locationPlaceholder}
                      value={destination ?? null}
                      onSelect={handleDestinationSelect}
                      onNearby={handleNearby}
                      onNeighborhoodSelect={handleNeighborhoodSelect}
                      suggestions={suggestions}
                      loading={loading}
                      geoError={state.geoError}
                      showNeighborhoods={state.showNeighborhoods}
                      placesData={state.placesData}
                    />
                  </motion.div>
                )}
                {activeSection === 'dates' && comp.showDates && (
                  <DateInput
                    key="dates"
                    dateMode={comp.dateMode!}
                    dateRange={strategy.getDateRange(state.form) ?? undefined}
                    experienceDate={strategy.getExperienceDate(state.form) ?? undefined}
                    onDateRangeChange={(r) =>
                      dispatch({ type: 'FORM_UPDATE', update: { field: 'dateRange', value: r } })
                    }
                    onExperienceDateChange={(e) =>
                      dispatch({
                        type: 'FORM_UPDATE',
                        update: { field: 'experienceDate', value: e ?? null },
                      })
                    }
                    onClose={closePanel}
                    dateAndTimeConfig={comp.dateAndTime}
                    referenceDate={new Date()}
                  />
                )}
                {activeSection === 'guests' && comp.showGuests && (
                  <GuestsInput
                    key="guests"
                    guestsMode={comp.guestsMode!}
                    guests={strategy.getGuests(state.form)}
                    participants={strategy.getParticipants(state.form)}
                    onGuestsChange={(g) =>
                      dispatch({ type: 'FORM_UPDATE', update: { field: 'guests', value: g } })
                    }
                    onParticipantsChange={(p) =>
                      dispatch({ type: 'FORM_UPDATE', update: { field: 'participants', value: p } })
                    }
                    onClose={closePanel}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {activeSection && (
            <motion.div
              key="mobile-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto"
            >
              <div className="p-4 pb-24">
                <div className="flex justify-between items-center mb-6">
                  <button
                    type="button"
                    onClick={closePanel}
                    className="w-10 h-10 rounded-full border flex items-center justify-center"
                  >
                    ×
                  </button>
                  <span className="font-semibold">{mobileSectionTitle}</span>
                  <div className="w-10" />
                </div>
                {activeSection === 'destination' && (
                  <LocationInput
                    placeholder={comp.locationPlaceholder}
                    value={destination ?? null}
                    onSelect={handleDestinationSelect}
                    onNearby={handleNearby}
                    onNeighborhoodSelect={handleNeighborhoodSelect}
                    suggestions={suggestions}
                    loading={loading}
                    geoError={state.geoError}
                    showNeighborhoods={state.showNeighborhoods}
                    placesData={state.placesData}
                  />
                )}
                {activeSection === 'dates' && comp.showDates && (
                  <DateInput
                    dateMode={comp.dateMode!}
                    dateRange={strategy.getDateRange(state.form) ?? undefined}
                    experienceDate={strategy.getExperienceDate(state.form) ?? undefined}
                    onDateRangeChange={(r) =>
                      dispatch({ type: 'FORM_UPDATE', update: { field: 'dateRange', value: r } })
                    }
                    onExperienceDateChange={(e) =>
                      dispatch({
                        type: 'FORM_UPDATE',
                        update: { field: 'experienceDate', value: e ?? null },
                      })
                    }
                    onClose={closePanel}
                    dateAndTimeConfig={comp.dateAndTime}
                    referenceDate={new Date()}
                  />
                )}
                {activeSection === 'guests' && comp.showGuests && (
                  <GuestsInput
                    guestsMode={comp.guestsMode!}
                    guests={strategy.getGuests(state.form)}
                    participants={strategy.getParticipants(state.form)}
                    onGuestsChange={(g) =>
                      dispatch({ type: 'FORM_UPDATE', update: { field: 'guests', value: g } })
                    }
                    onParticipantsChange={(p) =>
                      dispatch({ type: 'FORM_UPDATE', update: { field: 'participants', value: p } })
                    }
                    onClose={closePanel}
                  />
                )}
              </div>
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full py-3 bg-primary text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Buscar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {activeSection && (
        <div
          className="hidden md:block fixed inset-0 z-40"
          onClick={closePanel}
          onKeyDown={(e) => e.key === 'Escape' && closePanel()}
          role="button"
          tabIndex={0}
          aria-label="Cerrar buscador"
        />
      )}
    </div>
  )
}

export { getVariantFromPathname }
export type { SearchVariant }
