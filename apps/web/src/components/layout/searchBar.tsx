'use client'

import { useState, useEffect, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { Search, Plus, Minus, X, MapPin, Home, Binoculars } from 'lucide-react'
import { format } from 'date-fns'
import { es as dateFnsEs } from 'date-fns/locale'
import { es as dayPickerEs } from 'react-day-picker/locale'
import type { DateRange } from 'react-day-picker'
import { DayPicker } from 'react-day-picker'
import { locationsApi, type LocationSuggestion, type CityPlacesResponse } from '@/lib/api/locations'
import { SUGGESTED_DESTINATIONS, NEIGHBORHOODS_BY_CITY } from '@/lib/constants/destinations'

/** Spring para la cápsula: muy ágil, casi sin rebote (estilo Airbnb). */
const capsuleSpring = {
  type: 'spring' as const,
  stiffness: 520,
  damping: 38,
  mass: 0.7,
}

/** Spring para el panel al cambiar de ancho/posición: suave y rápido. */
const panelLayoutSpring = {
  type: 'spring' as const,
  stiffness: 350,
  damping: 32,
}

/** Transición del contenido interno: fade + micro-desplazamiento (0.18s). */
const panelContentTransition = {
  duration: 0.18,
  ease: [0.22, 0.61, 0.36, 1] as const,
}

type ActiveSection = 'destination' | 'dates' | 'guests' | null
type DateTab = 'dates' | 'months' | 'flexible'

interface SearchBarProps {
  initialSection?: ActiveSection
  onSearch?: (params: SearchParams) => void
  onClose?: () => void
}

export interface SearchParams {
  city: string
  region: string
  checkIn?: string
  checkOut?: string
  guests: number
  latitude?: number
  longitude?: number
}

/** Máquina de estados simple: click misma sección → cerrar; click otra → cambiar. */
function useSectionState(initial: ActiveSection) {
  const [activeSection, setActiveSection] = useState<ActiveSection>(initial ?? null)
  const toggle = (section: ActiveSection) => {
    setActiveSection((current) => (current === section ? null : section))
  }
  return [activeSection, toggle, setActiveSection] as const
}

const SearchBar = ({ initialSection, onSearch, onClose }: SearchBarProps) => {
  const router = useRouter()
  const [activeSection, toggleSection, setActiveSection] = useSectionState(initialSection ?? null)

  useEffect(() => {
    if (initialSection != null) setActiveSection(initialSection)
  }, [initialSection])
  const [dateTab, setDateTab] = useState<DateTab>('dates')
  const [destination, setDestination] = useState<{
    id?: string
    name: string
    city: string
    region: string
    isNearby?: boolean
    latitude?: number
    longitude?: number
  } | null>(null)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [placesData, setPlacesData] = useState<CityPlacesResponse | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [flexibleDuration, setFlexibleDuration] = useState<'weekend' | 'week' | 'month' | null>(null)
  const [flexibleMonth, setFlexibleMonth] = useState<Date | null>(null)
  const [monthsDuration, setMonthsDuration] = useState(1)
  const [guests, setGuests] = useState({
    adults: 0,
    children: 0,
    babies: 0,
    pets: 0,
  })
  const [showNeighborhoods, setShowNeighborhoods] = useState(false)

  const totalGuests = guests.adults + guests.children + guests.babies + guests.pets

  useEffect(() => {
    locationsApi
      .getSuggestions({ sortBy: 'displayOrder' })
      .then(setSuggestions)
      .catch(() => {
        setSuggestions(
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
  }, [])

  const citySlug = (name: string) =>
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')

  const handleNearbySelect = () => {
    setGeoError(null)
    setShowNeighborhoods(false)
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDestination({
          name: 'Cerca',
          city: 'Cerca',
          region: '',
          isNearby: true,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        })
        setGeoError(null)
        setActiveSection('dates')
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Permite el acceso a tu ubicación para ver alojamientos cerca de ti')
        } else {
          setGeoError('No se pudo obtener tu ubicación. Intenta de nuevo.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const handleDestinationSelect = (d: LocationSuggestion) => {
    setDestination({ id: d.id, name: d.name, city: d.city, region: d.region })
    const neighborhoods = NEIGHBORHOODS_BY_CITY[d.city]
    locationsApi
      .getPlacesByCity(citySlug(d.city))
      .then((data) => {
        if (data && data.places.length > 1) {
          setPlacesData(data)
          setShowNeighborhoods(true)
        } else {
          setPlacesData(null)
          setShowNeighborhoods(!!neighborhoods)
          if (!neighborhoods) setActiveSection('dates')
        }
      })
      .catch(() => {
        if (neighborhoods) {
          setPlacesData({
            city: { id: '', name: d.city, fullName: d.name, region: d.region },
            places: neighborhoods.map((n, i) => ({
              id: `fallback-${i}`,
              name: n.name,
              type: n.type === 'Estadio' ? 'STADIUM' : 'NEIGHBORHOOD',
              description: n.type,
            })),
          })
          setShowNeighborhoods(true)
        } else {
          setPlacesData(null)
          setShowNeighborhoods(false)
          setActiveSection('dates')
        }
      })
  }

  const handleNeighborhoodSelect = (name: string) => {
    setDestination((prev) => (prev ? { ...prev, name } : null))
    setShowNeighborhoods(false)
    setPlacesData(null)
    setActiveSection('dates')
  }

  const handleSearch = () => {
    const city = destination?.city ?? ''
    const region = destination?.region ?? ''
    const cityId = destination?.id
    const isNearby =
      destination?.isNearby && destination?.latitude != null && destination?.longitude != null
    const checkIn = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined
    const checkOut = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
    const g = totalGuests || 1

    if (cityId && /^[0-9a-f-]{36}$/i.test(cityId)) {
      locationsApi.logSearch(cityId).catch(() => {})
    }

    const params: SearchParams = { city, region, guests: g }
    if (checkIn) params.checkIn = checkIn
    if (checkOut) params.checkOut = checkOut
    if (isNearby && destination) {
      params.latitude = destination.latitude
      params.longitude = destination.longitude
    }

    if (onSearch) {
      onSearch(params)
    } else {
      const searchParams = new URLSearchParams()
      if (isNearby && destination) {
        searchParams.set('lat', String(destination.latitude))
        searchParams.set('lng', String(destination.longitude))
      } else if (city) {
        searchParams.set('city', city)
      }
      if (checkIn) searchParams.set('checkIn', checkIn)
      if (checkOut) searchParams.set('checkOut', checkOut)
      searchParams.set('guests', String(g))
      router.push(`/search?${searchParams.toString()}`)
    }
    onClose?.()
  }

  const getDatesLabel = () => {
    if (dateTab === 'flexible') {
      if (flexibleDuration === 'weekend') return 'Fin de semana'
      if (flexibleDuration === 'week') return 'Semana'
      if (flexibleDuration === 'month') return 'Mes'
      return 'Cualquier fecha'
    }
    if (dateTab === 'months') {
      return monthsDuration === 1 ? '1 mes' : `${monthsDuration} meses`
    }
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, 'd MMM', { locale: dateFnsEs })} - ${format(dateRange.to, 'd MMM', { locale: dateFnsEs })}`
    }
    if (dateRange?.from) return format(dateRange.from, 'd MMM', { locale: dateFnsEs })
    return 'Agrega fechas'
  }

  const getGuestsLabel = () => {
    if (totalGuests === 0) return '¿Cuántos?'
    return totalGuests === 1 ? '1 huésped' : `${totalGuests} huéspedes`
  }

  const updateGuests = (type: keyof typeof guests, increment: boolean) => {
    setGuests((prev) => ({
      ...prev,
      [type]: increment ? prev[type] + 1 : Math.max(0, prev[type] - 1),
    }))
  }

  const today = new Date()

  const sections: { id: ActiveSection; label: string; sublabel: () => React.ReactNode }[] = [
    {
      id: 'destination',
      label: 'Dónde',
      sublabel: () =>
        destination ? (
          <>
            <span>{destination.name}</span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                setDestination(null)
                setGeoError(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setDestination(null)
                }
              }}
              className="p-0.5 hover:bg-gray-200 rounded-full cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          </>
        ) : (
          '¿A dónde vas?'
        ),
    },
    { id: 'dates', label: 'Cuándo', sublabel: getDatesLabel },
    {
      id: 'guests',
      label: 'Quién',
      sublabel: () => (
        <>
          {getGuestsLabel()}
          {totalGuests > 0 && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                setGuests({ adults: 0, children: 0, babies: 0, pets: 0 })
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setGuests({ adults: 0, children: 0, babies: 0, pets: 0 })
                }
              }}
              className="p-0.5 hover:bg-gray-200 rounded-full cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
        </>
      ),
    },
  ]

  return (
    <div className="relative flex items-center justify-center h-16 w-full pb-4 max-w-[850px] mx-auto">
      {/* Wrapper por encima del backdrop para que un solo clic cambie de sección */}
      <div className="relative z-50 w-full">
        {/* Barra con pill que se desliza (layoutId = shared layout animation) */}
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
                      setShowNeighborhoods(false)
                      setGeoError(null)
                    }
                    toggleSection(id)
                  }}
                  className="relative z-10 w-full py-3 px-6 text-left rounded-full transition-colors"
                >
                <div className="text-xs font-semibold text-secondary">{label}</div>
                <div className="text-sm text-gray-600 truncate flex items-center gap-1">
                  {typeof sublabel === 'function' ? sublabel() : sublabel}
                </div>
              </button>
            </div>
          </Fragment>
        ))}
          </LayoutGroup>

        <button
          type="button"
          onClick={handleSearch}
          className="relative z-10 m-2 p-3 bg-primary hover:bg-primary/90 text-white rounded-full transition-colors flex items-center gap-2 shrink-0"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline text-sm font-semibold">Buscar</span>
        </button>
        </motion.div>

        {/* Panel único: no se desmonta, solo cambia el contenido interno con AnimatePresence */}
      {activeSection && (
        <div
          className="hidden md:flex absolute top-full left-0 right-0 mt-2 z-50 min-h-[320px]"
          style={{
            justifyContent:
              activeSection === 'destination'
                ? 'flex-start'
                : activeSection === 'dates'
                  ? 'center'
                  : 'flex-end',
          }}
        >
          <motion.div
            layout
            transition={panelLayoutSpring}
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            style={{
              width:
                activeSection === 'destination'
                  ? 425
                  : activeSection === 'dates'
                    ? 'min(90vw, 850px)'
                    : 400,
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {activeSection === 'destination' && (
                <motion.div
                  key="destination"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={panelContentTransition}
                  className="p-4 overflow-y-auto max-h-[480px]"
                >
                  <h3 className="text-xs font-semibold text-secondary mb-3">Destinos sugeridos</h3>
                  <button
                    type="button"
                    className="flex items-center gap-4 w-full px-4 py-3 hover:bg-gray-100 rounded-xl text-left transition-colors"
                    onClick={handleNearbySelect}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-secondary">Cerca</div>
                      <div className="text-sm text-gray-500">Descubre qué hay a tu alrededor</div>
                    </div>
                  </button>
                  {geoError && (
                    <p className="mt-2 px-4 py-2 text-sm text-red-600 bg-red-50 rounded-lg">
                      {geoError}
                    </p>
                  )}
                  {!showNeighborhoods
                    ? suggestions.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          className="flex items-center gap-4 w-full px-4 py-3 hover:bg-gray-100 rounded-xl text-left transition-colors"
                          onClick={() => handleDestinationSelect(d)}
                        >
                          <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <Home className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-secondary">{d.name}</div>
                            <div className="text-sm text-gray-500">{d.description ?? ''}</div>
                          </div>
                        </button>
                      ))
                    : placesData?.places.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          className="flex items-center gap-4 w-full px-4 py-3 hover:bg-gray-100 rounded-xl text-left transition-colors"
                          onClick={() => handleNeighborhoodSelect(n.name)}
                        >
                          <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0">
                            {n.type === 'STADIUM' ? (
                              <Binoculars className="w-5 h-5 text-gray-600" />
                            ) : (
                              <Home className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-secondary">{n.name}</div>
                            <div className="text-sm text-gray-500">
                              {n.description ??
                                (n.type === 'STADIUM'
                                  ? 'Estadio'
                                  : n.type === 'LANDMARK'
                                    ? 'Lugar emblemático'
                                    : 'Vecindario')}
                            </div>
                          </div>
                        </button>
                      ))}
                </motion.div>
              )}

              {activeSection === 'dates' && (
                <motion.div
                  key="dates"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={panelContentTransition}
                  className="p-6"
                >
                  <div className="flex justify-center gap-1 mb-6 p-1 bg-gray-100 rounded-full w-fit mx-auto">
                    {(['dates', 'months', 'flexible'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setDateTab(tab)}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                          dateTab === tab ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                        }`}
                      >
                        {tab === 'dates' ? 'Fechas' : tab === 'months' ? 'Meses' : 'Flexible'}
                      </button>
                    ))}
                  </div>

                  {dateTab === 'dates' && (
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      disabled={{ before: today }}
                      numberOfMonths={2}
                      locale={dayPickerEs}
                      classNames={{
                        month: 'flex flex-col gap-4',
                        months: 'flex gap-8',
                        month_caption: 'flex justify-center font-semibold',
                        weekdays: 'flex',
                        weekday: 'w-9 text-center text-sm text-gray-500',
                        week: 'flex',
                        day: 'w-9 h-9',
                        day_button:
                          'w-full h-full rounded-full hover:bg-gray-100 transition-colors',
                        selected: 'bg-gray-900 text-white hover:bg-gray-900',
                        range_start: 'bg-gray-900 text-white rounded-l-full',
                        range_end: 'bg-gray-900 text-white rounded-r-full',
                        range_middle: 'bg-gray-100',
                        disabled: 'text-gray-300',
                        today: 'bg-gray-100 font-semibold',
                      }}
                    />
                  )}

                  {dateTab === 'months' && (
                    <div className="flex flex-col items-center gap-6">
                      <p className="text-center font-medium">¿Cuándo es tu viaje?</p>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => setMonthsDuration((n) => Math.max(1, n - 1))}
                          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="text-center">
                          <span className="text-3xl font-semibold">{monthsDuration}</span>
                          <span className="block text-sm text-gray-500">meses</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMonthsDuration((n) => Math.min(12, n + 1))}
                          className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {dateTab === 'flexible' && (
                    <div className="space-y-6">
                      <p className="font-medium">¿Cuánto tiempo quieres quedarte?</p>
                      <div className="flex gap-2">
                        {[
                          { id: 'weekend' as const, label: 'Fin de semana' },
                          { id: 'week' as const, label: 'Semana' },
                          { id: 'month' as const, label: 'Mes' },
                        ].map((o) => (
                          <button
                            key={o.id}
                            type="button"
                            onClick={() =>
                              setFlexibleDuration(
                                flexibleDuration === o.id ? null : o.id
                              )
                            }
                            className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                              flexibleDuration === o.id
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'border-gray-300 hover:border-gray-900'
                            }`}
                          >
                            {o.label}
                          </button>
                        ))}
                      </div>
                      <p className="font-medium">¿Cuándo quieres ir?</p>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {Array.from({ length: 12 }, (_, i) => {
                          const d = new Date()
                          d.setMonth(d.getMonth() + i)
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setFlexibleMonth(d)}
                              className={`flex flex-col items-center px-4 py-3 rounded-xl border flex-shrink-0 transition-colors ${
                                flexibleMonth?.getMonth() === d.getMonth()
                                  ? 'border-gray-900 bg-gray-50'
                                  : 'border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              <span className="text-sm font-medium">
                                {d.toLocaleDateString('es', { month: 'long' })}
                              </span>
                              <span className="text-xs text-gray-500">{d.getFullYear()}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeSection === 'guests' && (
                <motion.div
                  key="guests"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={panelContentTransition}
                  className="p-6"
                >
                  {[
                    {
                      key: 'adults' as const,
                      label: 'Adultos',
                      sub: 'Edad: 13 años o más',
                    },
                    { key: 'children' as const, label: 'Niños', sub: 'Edades 2-12' },
                    { key: 'babies' as const, label: 'Bebés', sub: 'Menos de 2 años' },
                    {
                      key: 'pets' as const,
                      label: 'Mascotas',
                      sub: '¿Traes a un animal de servicio?',
                    },
                  ].map(({ key, label, sub }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between py-4 border-b border-gray-200 last:border-0"
                    >
                      <div>
                        <div className="font-semibold text-secondary">{label}</div>
                        <div className="text-sm text-gray-500">{sub}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateGuests(key, false)}
                          disabled={guests[key] === 0}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:border-gray-900"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-medium">{guests[key]}</span>
                        <button
                          type="button"
                          onClick={() => updateGuests(key, true)}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-900"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Mobile: modal fullscreen (mismo contenido, sin layoutId en panel) */}
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
                  onClick={() => setActiveSection(null)}
                  className="w-10 h-10 rounded-full border flex items-center justify-center"
                >
                  ×
                </button>
                <span className="font-semibold">
                  {activeSection === 'destination' && 'Dónde'}
                  {activeSection === 'dates' && 'Cuándo'}
                  {activeSection === 'guests' && 'Quién'}
                </span>
                <div className="w-10" />
              </div>

              {activeSection === 'destination' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Destinos sugeridos</h3>
                  <button
                    type="button"
                    className="flex items-center gap-4 w-full py-3 border-b text-left"
                    onClick={handleNearbySelect}
                  >
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <div className="font-medium">Cerca</div>
                      <div className="text-sm text-gray-500">Descubre qué hay a tu alrededor</div>
                    </div>
                  </button>
                  {geoError && (
                    <p className="mt-2 py-2 text-sm text-red-600 bg-red-50 rounded-lg px-4">
                      {geoError}
                    </p>
                  )}
                  {!showNeighborhoods
                    ? suggestions.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          className="flex items-center gap-4 w-full py-3 border-b text-left"
                          onClick={() => handleDestinationSelect(d)}
                        >
                          <Home className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="font-medium">{d.name}</div>
                            <div className="text-sm text-gray-500">{d.description ?? ''}</div>
                          </div>
                        </button>
                      ))
                    : placesData?.places.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          className="flex items-center gap-4 w-full py-3 border-b text-left"
                          onClick={() => handleNeighborhoodSelect(n.name)}
                        >
                          <Home className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="font-medium">{n.name}</div>
                            <div className="text-sm text-gray-500">
                              {n.description ??
                                (n.type === 'STADIUM'
                                  ? 'Estadio'
                                  : n.type === 'LANDMARK'
                                    ? 'Lugar emblemático'
                                    : 'Vecindario')}
                            </div>
                          </div>
                        </button>
                      ))}
                </div>
              )}

              {activeSection === 'dates' && (
                <div>
                  <div className="flex gap-2 mb-6">
                    {(['dates', 'months', 'flexible'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setDateTab(tab)}
                        className={`px-4 py-2 rounded-full text-sm ${
                          dateTab === tab ? 'bg-gray-900 text-white' : 'bg-gray-100'
                        }`}
                      >
                        {tab === 'dates' ? 'Fechas' : tab === 'months' ? 'Meses' : 'Flexible'}
                      </button>
                    ))}
                  </div>
                  {dateTab === 'dates' && (
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={setDateRange}
                      disabled={{ before: today }}
                      numberOfMonths={1}
                      locale={dayPickerEs}
                    />
                  )}
                  {dateTab === 'months' && (
                    <div className="flex items-center justify-center gap-4 py-8">
                      <button
                        type="button"
                        onClick={() => setMonthsDuration((n) => Math.max(1, n - 1))}
                        className="w-10 h-10 rounded-full border flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-2xl font-semibold">{monthsDuration} meses</span>
                      <button
                        type="button"
                        onClick={() => setMonthsDuration((n) => Math.min(12, n + 1))}
                        className="w-10 h-10 rounded-full border flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {dateTab === 'flexible' && (
                    <div className="space-y-4">
                      <p className="font-medium">¿Cuánto tiempo quieres quedarte?</p>
                      <div className="flex gap-2">
                        {['Fin de semana', 'Semana', 'Mes'].map((l, i) => (
                          <button
                            key={l}
                            type="button"
                            onClick={() =>
                              setFlexibleDuration(
                                flexibleDuration === (['weekend', 'week', 'month'] as const)[i]
                                  ? null
                                  : (['weekend', 'week', 'month'] as const)[i]
                              )
                            }
                            className="px-4 py-2 rounded-full border text-sm"
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'guests' && (
                <div className="space-y-4">
                  {[
                    { key: 'adults' as const, label: 'Adultos', sub: 'Edad: 13 años o más' },
                    { key: 'children' as const, label: 'Niños', sub: 'Edades 2-12' },
                    { key: 'babies' as const, label: 'Bebés', sub: 'Menos de 2 años' },
                    {
                      key: 'pets' as const,
                      label: 'Mascotas',
                      sub: '¿Traes a un animal de servicio?',
                    },
                  ].map(({ key, label, sub }) => (
                    <div key={key} className="flex justify-between items-center py-4 border-b">
                      <div>
                        <div className="font-semibold">{label}</div>
                        <div className="text-sm text-gray-500">{sub}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateGuests(key, false)}
                          disabled={guests[key] === 0}
                          className="w-8 h-8 rounded-full border flex items-center justify-center disabled:opacity-40"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center">{guests[key]}</span>
                        <button
                          type="button"
                          onClick={() => updateGuests(key, true)}
                          className="w-8 h-8 rounded-full border flex items-center justify-center"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
              <button
                type="button"
                onClick={handleSearch}
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

      {/* Backdrop desktop: detrás de la barra (z-40); click cierra */}
      {activeSection && (
        <div
          className="hidden md:block fixed inset-0 z-40"
          onClick={() => setActiveSection(null)}
          onKeyDown={(e) => e.key === 'Escape' && setActiveSection(null)}
          role="button"
          tabIndex={0}
          aria-label="Cerrar buscador"
        />
      )}
    </div>
  )
}

export default SearchBar
