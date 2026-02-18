'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import SearchBar from './searchBar'
import ExperienceDatePicker from '../search/ExperienceDatePicker'
import ParticipantsSelector from '../search/ParticipantsSelector'
import { getSearchConfig, detectSearchSection, type SearchSection } from '@/lib/search/search-config'
import { locationsApi, type LocationSuggestion } from '@/lib/api/locations'
import { SUGGESTED_DESTINATIONS } from '@/lib/constants/destinations'
import { MapPin, Search } from 'lucide-react'
import type { SearchParams } from './searchBar'

/** Spring para la pill de experiencias (igual que SearchBar). */
const capsuleSpring = {
  type: 'spring' as const,
  stiffness: 520,
  damping: 38,
  mass: 0.7,
}

const panelContentTransition = {
  duration: 0.18,
  ease: [0.22, 0.61, 0.36, 1] as const,
}

type ExperienceField = 'destination' | 'dates' | 'participants' | null

interface ModularSearchBarProps {
  initialSection?: string
  onClose?: () => void
}

/** Toggle: click misma sección → cerrar; click otra → cambiar. */
function useFieldState(initial: string | null) {
  const [activeField, setActiveField] = useState<string | null>(initial || null)
  const toggle = (field: ExperienceField) => {
    setActiveField((current) => (current === field ? null : field))
  }
  return [activeField, toggle, setActiveField] as const
}

/**
 * Buscador modular que se adapta según la sección activa
 * - Accommodations: Usa SearchBar original (check-in/check-out, huéspedes)
 * - Experiences: Pill animada con layoutId, un solo clic, panel único
 * - Services: Se implementará después
 */
export default function ModularSearchBar({ initialSection, onClose }: ModularSearchBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const section = detectSearchSection(pathname ?? '')
  const config = getSearchConfig(section)

  const [destination, setDestination] = useState<{
    name: string
    city: string
    region: string
  } | null>(null)
  const [experienceDate, setExperienceDate] = useState<{
    type: 'today' | 'tomorrow' | 'weekend' | 'specific'
    date?: Date
    time?: string
  } | null>(null)
  const [participants, setParticipants] = useState<{
    adults: number
    children: number
    babies: number
  } | null>(null)
  const [activeField, toggleField, setActiveField] = useFieldState(initialSection || null)
  const [destinationSuggestions, setDestinationSuggestions] = useState<LocationSuggestion[]>([])

  useEffect(() => {
    if (section === 'experiences') {
      locationsApi
        .getSuggestions({ sortBy: 'displayOrder' })
        .then(setDestinationSuggestions)
        .catch(() => {
          setDestinationSuggestions(
            SUGGESTED_DESTINATIONS.map((d) => ({
              id: d.city,
              name: d.name,
              city: d.city,
              region: d.region,
              description: d.description,
              latitude: null,
              longitude: null,
            }))
          )
        })
    }
  }, [section])

  useEffect(() => {
    if (initialSection != null) setActiveField(initialSection)
  }, [initialSection])

  // Para Accommodations, usar el SearchBar original
  if (section === 'accommodations') {
    return <SearchBar initialSection={initialSection as any} onClose={onClose} />
  }

  // Para Experiences: misma lógica que SearchBar (pill con layoutId, un clic, panel único)
  if (section === 'experiences') {
    const handleSearch = () => {
      const params = config.searchParamsBuilder({
        destination: destination ? {
          city: destination.city,
          region: destination.region,
        } : null,
        dateType: experienceDate?.type,
        date: experienceDate?.date ? experienceDate.date.toISOString() : undefined,
        time: experienceDate?.time,
        participants,
      })
      router.push(`${config.searchRoute}?${params.toString()}`)
      onClose?.()
    }

    const getFieldLabel = (fieldId: string) => {
      const field = config.fields.find((f) => f.id === fieldId)
      return field?.placeholder || ''
    }

    const fields: { id: ExperienceField; label: string; sublabel: string }[] = [
      {
        id: 'destination',
        label: 'Dónde',
        sublabel: destination ? destination.name : getFieldLabel('destination'),
      },
      {
        id: 'dates',
        label: 'Fechas',
        sublabel: experienceDate
          ? experienceDate.type === 'today'
            ? 'Hoy'
            : experienceDate.type === 'tomorrow'
              ? 'Mañana'
              : experienceDate.type === 'weekend'
                ? 'Este fin de semana'
                : experienceDate.date?.toLocaleDateString('es-ES') ?? 'Agrega fechas'
          : getFieldLabel('dates'),
      },
      {
        id: 'participants',
        label: 'Quién',
        sublabel:
          participants && participants.adults + participants.children + participants.babies > 0
            ? `${participants.adults + participants.children + participants.babies} participantes`
            : getFieldLabel('participants'),
      },
    ]

    return (
      <div className="relative w-full max-w-[850px] mx-auto">
        {/* Wrapper por encima del overlay para un solo clic */}
        <div className="relative z-50 w-full">
          <motion.div
            layout
            className={`flex items-center w-full border border-gray-300 rounded-full shadow-lg p-1.5 ${
              activeField ? 'bg-[#EBEBEB]' : 'bg-white'
            }`}
          >
            <LayoutGroup>
              {fields.map(({ id, label, sublabel }, index) => (
                <Fragment key={id}>
                  {index > 0 && (
                    <div
                      className={`h-9 w-px shrink-0 flex-shrink-0 ${activeField ? 'bg-transparent' : 'bg-gray-200'}`}
                    />
                  )}
                  <div className="flex-1 relative min-w-0">
                    {activeField === id && (
                      <motion.div
                        layoutId="experience-search-pill"
                        transition={capsuleSpring}
                        className="absolute inset-0 bg-white rounded-full shadow-xl"
                        style={{ margin: 3 }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => toggleField(id)}
                      className="relative z-10 w-full px-6 py-3.5 text-left rounded-full transition-colors"
                    >
                      <div className="text-xs font-semibold text-secondary">{label}</div>
                      <div className="text-sm text-gray-500 truncate mt-0.5">{sublabel}</div>
                    </button>
                  </div>
                </Fragment>
              ))}
            </LayoutGroup>

            <button
              type="button"
              onClick={handleSearch}
              className="relative z-10 px-6 py-3.5 bg-primary text-white rounded-full font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 shrink-0 m-1.5"
            >
              <Search className="w-5 h-5" />
              Buscar
            </button>
          </motion.div>

          {/* Panel único: no se desmonta, solo cambia el contenido con AnimatePresence */}
          {activeField && (
            <div
              className="absolute top-full left-0 right-0 mt-2 min-h-[280px] flex"
              style={{
                justifyContent:
                  activeField === 'destination'
                    ? 'flex-start'
                    : activeField === 'dates'
                      ? 'center'
                      : 'flex-end',
              }}
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 350, damping: 32 }}
                className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
                style={{
                  width:
                    activeField === 'destination'
                      ? 380
                      : activeField === 'dates'
                        ? 'min(90vw, 500px)'
                        : 360,
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {activeField === 'destination' && (
                    <motion.div
                      key="destination"
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      transition={panelContentTransition}
                      className="p-6 max-h-[400px] overflow-y-auto"
                    >
                      <h3 className="font-semibold text-secondary mb-4">Destinos sugeridos</h3>
                      <div className="space-y-2">
                        {destinationSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            type="button"
                            onClick={() => {
                              setDestination({
                                name: suggestion.name,
                                city: suggestion.city,
                                region: suggestion.region,
                              })
                              setActiveField(null)
                            }}
                            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 flex items-center gap-3 transition-colors"
                          >
                            <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <div className="flex-1">
                              <div className="font-medium text-secondary">{suggestion.name}</div>
                              {suggestion.description && (
                                <div className="text-sm text-gray-500">{suggestion.description}</div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeField === 'dates' && (
                    <motion.div
                      key="dates"
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      transition={panelContentTransition}
                      className="p-6"
                    >
                      <ExperienceDatePicker
                        value={experienceDate || undefined}
                        onChange={(value) => setExperienceDate(value)}
                        onClose={() => setActiveField(null)}
                      />
                    </motion.div>
                  )}

                  {activeField === 'participants' && (
                    <motion.div
                      key="participants"
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -3 }}
                      transition={panelContentTransition}
                      className="p-6"
                    >
                      <ParticipantsSelector
                        value={participants || undefined}
                        onChange={setParticipants}
                        onClose={() => setActiveField(null)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </div>

        {/* Overlay detrás de la barra (z-40); click cierra */}
        {activeField && (
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setActiveField(null)}
            onKeyDown={(e) => e.key === 'Escape' && setActiveField(null)}
            role="button"
            tabIndex={0}
            aria-label="Cerrar buscador"
          />
        )}
      </div>
    )
  }

  // Para Services (placeholder)
  return (
    <div className="w-full max-w-[850px] mx-auto p-4 bg-white rounded-full border border-gray-300">
      <p className="text-center text-gray-500">Buscador de servicios (próximamente)</p>
    </div>
  )
}
