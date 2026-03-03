'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { X, Calendar, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  isSameMonth,
  addDays,
  startOfWeek,
} from 'date-fns'
import { es } from 'date-fns/locale'
import type { ExperienceSlot } from './ExperienceBookingCard'

interface SelectTimeModalProps {
  isOpen: boolean
  onClose: () => void
  experienceId: string
  experienceTitle: string
  slots: ExperienceSlot[]
  pricePerParticipant: number
  currency: string
  /** Duración en minutos, ej. 90 → "1 h 30 min" */
  durationMinutes?: number
  /** URL de imagen para la sesión grupal (opcional) */
  imageUrl?: string | null
  onSelectSlot: (slot: ExperienceSlot, adults: number, children: number) => void
}

function formatPrice(price: number, currency: string) {
  if (currency === 'COP') return `$${price.toLocaleString('es-CO')} COP`
  return `${price.toLocaleString()} ${currency}`
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}

/** Horarios fijos para Sesión grupal y Sesión Privada (9:00 a.m. – 3:30 p.m., cada 30 min) */
const FIXED_TIME_LABELS = [
  '9:00 a.m.',
  '9:30 a.m.',
  '10:00 a.m.',
  '10:30 a.m.',
  '11:00 a.m.',
  '11:30 a.m.',
  '12:00 p.m.',
  '12:30 p.m.',
  '1:00 p.m.',
  '1:30 p.m.',
  '2:00 p.m.',
  '2:30 p.m.',
  '3:00 p.m.',
  '3:30 p.m.',
]

/** Calcula hora de fin sumando minutos (ej. 90 min → "10:30 a.m." desde "9:00 a.m.") */
function addMinutesToTimeLabel(startLabel: string, durationMinutes: number): string {
  const match = startLabel.match(/^(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)$/i)
  if (!match) return `${startLabel} – `
  let [, hStr, mStr, period] = match
  let h = parseInt(hStr!, 10)
  const m = parseInt(mStr!, 10)
  if (period?.toLowerCase() === 'p.m.' && h !== 12) h += 12
  if (period?.toLowerCase() === 'a.m.' && h === 12) h = 0
  const totalMinutes = h * 60 + m + durationMinutes
  const endH = Math.floor(totalMinutes / 60) % 24
  const endM = totalMinutes % 60
  const endPeriod = endH >= 12 ? 'p.m.' : 'a.m.'
  const endH12 = endH % 12 || 12
  return `${endH12}:${endM.toString().padStart(2, '0')} ${endPeriod}`
}

function buildSyntheticSlot(
  selectedDate: Date,
  timeLabel: string,
  durationMinutes: number,
  dateStr: string
): ExperienceSlot {
  const endLabel = addMinutesToTimeLabel(timeLabel, durationMinutes)
  return {
    id: `modal-${dateStr}-${timeLabel.replace(/\s|\./g, '')}`,
    dateLabel: format(selectedDate, "EEEE d 'de' MMMM", { locale: es }),
    timeRange: `${timeLabel} – ${endLabel}`,
    spotsLeft: 10,
    date: dateStr,
  }
}

const SESSION_GROUP_IMAGE =
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=120&h=120&fit=crop'
const SESSION_PRIVATE_IMAGE =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop'

export default function SelectTimeModal({
  isOpen,
  onClose,
  experienceTitle,
  slots,
  pricePerParticipant,
  currency,
  durationMinutes = 90,
  imageUrl,
  onSelectSlot,
}: SelectTimeModalProps) {
  const [travelers, setTravelers] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
    const d = addDays(new Date(), 1)
    d.setHours(0, 0, 0, 0)
    return d
  })
  /** Al hacer clic en el icono de calendario se muestra el modal con los 4 meses */
  const [showAllMonths, setShowAllMonths] = useState(false)

  /** Semana actual para la franja horizontal (lunes a domingo); se usa la semana que contiene la fecha seleccionada */
  const weekStart = useMemo(() => {
    const base = selectedDate ?? addDays(new Date(), 1)
    return startOfWeek(base, { weekStartsOn: 1 })
  }, [selectedDate])
  const weekDays = useMemo(
    () => [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(weekStart, i)),
    [weekStart]
  )
  const displayMonth = selectedDate ?? addDays(new Date(), 1)

  /** 4 meses a partir del actual para el modal de calendario */
  const fourMonths = useMemo(() => {
    const base = new Date()
    base.setDate(1)
    base.setHours(0, 0, 0, 0)
    return [0, 1, 2, 3].map((i) => addMonths(base, i))
  }, [])

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
  /** Horario seleccionado (ej. "10:00 a.m."); al dar Siguiente se confirma y se navega */
  const [selectedTimeLabel, setSelectedTimeLabel] = useState<string | null>(null)

  const handleTimeSlotClick = (timeLabel: string) => {
    setSelectedTimeLabel(timeLabel)
  }

  const handleSiguiente = () => {
    if (!selectedDate || !selectedDateStr || !selectedTimeLabel) return
    const slot = buildSyntheticSlot(
      selectedDate,
      selectedTimeLabel,
      durationMinutes,
      selectedDateStr
    )
    onSelectSlot(slot, travelers, 0)
    onClose()
  }

  const durationLabel = formatDuration(durationMinutes)
  const priceGroup = pricePerParticipant
  const pricePrivate = Math.round(pricePerParticipant * 2.33)
  const minGroup = Math.round(priceGroup * 1.33)

  if (!isOpen) return null

  const modalTitle =
    experienceTitle.toLowerCase().includes('foto') ||
    experienceTitle.toLowerCase().includes('fotograf')
      ? 'Programa tu sesión fotográfica'
      : 'Programa tu experiencia'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-[480px] max-h-[88vh] rounded-lg bg-white shadow-xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ——— SECCIÓN 1: Header ——— */}
          <div className="flex items-center justify-between px-3 py-2.5 border-b border-neutral-200 flex-shrink-0">
            <h2 className="text-sm font-semibold text-[#222222]">
              {modalTitle}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full hover:bg-neutral-100 text-neutral-700"
              aria-label="Cerrar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* ——— SECCIÓN 2: Viajeros ——— */}
            <div className="px-3 py-2.5 border-b border-neutral-100 flex items-center justify-between">
              <span className="text-xs text-[#222222]">
                {travelers} {travelers === 1 ? 'viajero' : 'viajeros'}
              </span>
              <div className="flex items-center gap-0.5 border border-neutral-300 rounded-full overflow-hidden">
                <button
                  type="button"
                  onClick={() => setTravelers((n) => Math.max(1, n - 1))}
                  className="w-7 h-7 flex items-center justify-center hover:bg-neutral-50 text-[#222222]"
                  aria-label="Menos"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-5 text-center text-[11px] font-medium text-[#222222]">
                  {travelers}
                </span>
                <button
                  type="button"
                  onClick={() => setTravelers((n) => n + 1)}
                  className="w-7 h-7 flex items-center justify-center hover:bg-neutral-50 text-[#222222]"
                  aria-label="Más"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* ——— SECCIÓN 3: Calendario por semana (el botón abre modal de 4 meses) ——— */}
            <div className="px-3 py-2.5 border-b border-neutral-100">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#222222] capitalize">
                  {format(displayMonth, 'MMMM yyyy', { locale: es })}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllMonths(true)}
                  className="p-1 rounded-md hover:bg-neutral-100 text-neutral-600"
                  aria-label="Ver calendario de meses"
                >
                  <Calendar className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'].map((d) => (
                  <span key={d} className="text-[9px] text-neutral-500 font-medium pb-0.5">
                    {d}
                  </span>
                ))}
                {weekDays.map((day) => {
                  const isCurrMonth = isSameMonth(day, displayMonth)
                  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const dayStart = new Date(day)
                  dayStart.setHours(0, 0, 0, 0)
                  const isPast = dayStart < today
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      disabled={isPast}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square min-w-[22px] max-w-[26px] rounded-full text-[10px] font-medium flex items-center justify-center transition-colors ${
                        !isCurrMonth
                          ? 'text-neutral-400'
                          : isPast
                            ? 'text-neutral-300 cursor-not-allowed'
                            : isSelected
                              ? 'bg-[#222222] text-white'
                              : 'text-[#222222] hover:bg-neutral-100'
                      }`}
                    >
                      {format(day, 'd')}
                    </button>
                  )
                })}
              </div>
              <div className="flex justify-center gap-0.5 mt-1">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDate(addDays(selectedDate ?? weekStart, -7))
                  }
                  className="p-0.5 rounded-md hover:bg-neutral-100 text-neutral-600"
                  aria-label="Semana anterior"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDate(addDays(selectedDate ?? weekStart, 7))
                  }
                  className="p-0.5 rounded-md hover:bg-neutral-100 text-neutral-600"
                  aria-label="Semana siguiente"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* ——— SECCIÓN 4: Sesión grupal y Sesión privada ——— */}
            <div className="px-3 py-2.5 space-y-3">
              {/* Sesión grupal */}
              <div className="border border-neutral-200 rounded-lg p-2.5 overflow-hidden">
                <div className="flex gap-2.5">
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-neutral-100 flex-shrink-0">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt="Sesión grupal"
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <Image
                        src={SESSION_GROUP_IMAGE}
                        alt="Sesión grupal"
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-semibold text-[#222222]">
                      Sesión grupal
                    </h3>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      {formatPrice(priceGroup, currency)} por persona
                    </p>
                    <p className="text-[11px] text-neutral-600">
                      Mínimo {formatPrice(minGroup, currency)} · {durationLabel}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedDateStr ? (
                    FIXED_TIME_LABELS.map((label) => {
                      const isSelected = selectedTimeLabel === label
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => handleTimeSlotClick(label)}
                          className={`px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
                            isSelected
                              ? 'border-[#222222] bg-[#222222] text-white'
                              : 'border-neutral-300 bg-white text-[#222222] hover:border-[#222222] hover:bg-neutral-50'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })
                  ) : (
                    <p className="text-[11px] text-neutral-500">
                      Selecciona una fecha para ver horarios
                    </p>
                  )}
                </div>
              </div>

              {/* Sesión privada */}
              <div className="border border-neutral-200 rounded-lg p-2.5 overflow-hidden">
                <div className="flex gap-2.5">
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-neutral-100 flex-shrink-0">
                    <Image
                      src={SESSION_PRIVATE_IMAGE}
                      alt="Sesión privada"
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-semibold text-[#222222]">
                      Sesión Privada
                    </h3>
                    <p className="text-[11px] text-neutral-600 mt-0.5">
                      {formatPrice(pricePrivate, currency)} por persona
                    </p>
                    <p className="text-[11px] text-neutral-600">
                      {durationLabel}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedDateStr ? (
                    FIXED_TIME_LABELS.map((label) => {
                      const isSelected = selectedTimeLabel === label
                      return (
                        <button
                          key={`private-${label}`}
                          type="button"
                          onClick={() => handleTimeSlotClick(label)}
                          className={`px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
                            isSelected
                              ? 'border-[#222222] bg-[#222222] text-white'
                              : 'border-neutral-300 bg-white text-[#222222] hover:border-[#222222] hover:bg-neutral-50'
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })
                  ) : (
                    <p className="text-[11px] text-neutral-500">
                      Selecciona una fecha para ver horarios
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Barra inferior: mínimo para reservar + Siguiente (va a la pasarela de pago vía página de reserva) */}
            <div className="flex-shrink-0 border-t border-neutral-200 px-3 py-3 flex items-center justify-between gap-4 bg-white">
              <p className="text-[11px] text-[#222222]">
                <span className="font-semibold">{formatPrice(minGroup, currency)}</span>
                {' '}
                como mínimo para reservar
              </p>
              <button
                type="button"
                disabled={!selectedDateStr || !selectedTimeLabel}
                onClick={handleSiguiente}
                className="px-4 py-2 rounded-lg bg-[#222222] text-white text-xs font-semibold hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        </motion.div>

        {/* Modal secundario: calendario de 4 meses (hacia abajo); al abrir/cerrar vuelve al modal principal */}
        <AnimatePresence>
          {showAllMonths && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[210] flex items-start justify-center pt-[12vh] pb-4 px-4"
              onClick={() => setShowAllMonths(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-[320px] max-h-[70vh] rounded-lg bg-white shadow-xl flex flex-col overflow-hidden border border-neutral-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-100 flex-shrink-0">
                  <span className="text-xs font-semibold text-[#222222] capitalize">
                    Calendario
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAllMonths(false)}
                    className="p-1 rounded hover:bg-neutral-100 text-neutral-600"
                    aria-label="Cerrar calendario"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="overflow-y-auto overflow-x-hidden flex-1 min-h-0">
                  {fourMonths.map((month) => {
                    const mStart = startOfMonth(month)
                    const mEnd = endOfMonth(month)
                    const mDays = eachDayOfInterval({ start: mStart, end: mEnd })
                    const pad = (mStart.getDay() + 6) % 7
                    const padArr = Array.from({ length: pad }, () => null)
                    const days = [...padArr, ...mDays]
                    return (
                      <div key={month.getTime()} className="px-3 py-2 border-b border-neutral-100 last:border-b-0">
                        <p className="text-[11px] font-medium text-[#222222] capitalize mb-1.5">
                          {format(month, 'MMMM yyyy', { locale: es })}
                        </p>
                        <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] text-neutral-500 mb-0.5">
                          {['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'].map((d) => (
                            <span key={d}>{d}</span>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-0.5">
                          {days.map((day, i) => {
                            if (day === null) {
                              return <div key={`p-${i}`} className="aspect-square min-w-[18px]" />
                            }
                            const isCurrMonth = isSameMonth(day, month)
                            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            const dayStart = new Date(day)
                            dayStart.setHours(0, 0, 0, 0)
                            const isPast = dayStart < today
                            return (
                              <button
                                key={day.toISOString()}
                                type="button"
                                disabled={isPast}
                                onClick={() => {
                                  setSelectedDate(day)
                                  setShowAllMonths(false)
                                }}
                                className={`aspect-square min-w-[18px] max-w-[24px] rounded-full text-[10px] font-medium flex items-center justify-center transition-colors ${
                                  !isCurrMonth
                                    ? 'text-neutral-300'
                                    : isPast
                                      ? 'text-neutral-300 cursor-not-allowed'
                                      : isSelected
                                        ? 'bg-[#222222] text-white'
                                        : 'text-[#222222] hover:bg-neutral-100'
                                }`}
                              >
                                {format(day, 'd')}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
