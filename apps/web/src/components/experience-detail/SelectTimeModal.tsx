'use client'

import { useState } from 'react'
import { X, Calendar, Minus, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths } from 'date-fns'
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
  onSelectSlot: (slot: ExperienceSlot, adults: number, children: number) => void
}

function formatPrice(price: number, currency: string) {
  if (currency === 'COP') return `$${price.toLocaleString('es-CO')} COP`
  return `${price.toLocaleString()} ${currency}`
}

function groupSlotsByDate(slots: ExperienceSlot[]) {
  const map = new Map<string, ExperienceSlot[]>()
  for (const slot of slots) {
    const key = slot.dateLabel
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(slot)
  }
  return Array.from(map.entries())
}

export default function SelectTimeModal({
  isOpen,
  onClose,
  experienceId,
  experienceTitle,
  slots,
  pricePerParticipant,
  currency,
  onSelectSlot,
}: SelectTimeModalProps) {
  const [view, setView] = useState<'slots' | 'calendar'>('slots')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const grouped = groupSlotsByDate(slots)

  const [calendarMonth, setCalendarMonth] = useState(() => new Date())

  const monthStart = startOfMonth(calendarMonth)
  const monthEnd = endOfMonth(calendarMonth)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })
  // Lunes = 0 para la grilla (getDay: 0=Dom, 1=Lun... → (d + 6) % 7)
  const startPadding = ((monthStart.getDay() + 6) % 7)
  const paddingDays = Array.from({ length: startPadding }, (_, i) => null)
  const gridDays = [...paddingDays, ...monthDays]

  const handleSlotClick = (slot: ExperienceSlot) => {
    onSelectSlot(slot, adults, children)
    onClose()
  }

  if (!isOpen) return null

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
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg max-h-[90vh] rounded-2xl bg-white shadow-xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 flex-shrink-0">
            <h2 className="text-xl font-semibold text-neutral-900">Selecciona una hora</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-100"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5 text-neutral-700" />
            </button>
          </div>

          {/* Guest selector */}
          <div className="px-4 py-3 border-b border-neutral-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-900">
                {adults} {adults === 1 ? 'adulto' : 'adultos'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAdults((a) => Math.max(1, a - 1))}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-50"
                  aria-label="Menos adultos"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-6 text-center text-sm font-medium">{adults}</span>
                <button
                  type="button"
                  onClick={() => setAdults((a) => a + 1)}
                  className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:bg-neutral-50"
                  aria-label="Más adultos"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              type="button"
              className="text-sm text-neutral-600 underline hover:text-neutral-900"
            >
              Agregar niños
            </button>
          </div>

          {view === 'slots' ? (
            <>
              {/* Month + calendar icon */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                <span className="text-sm font-medium text-neutral-900 capitalize">
                  {format(new Date(), 'MMMM yyyy', { locale: es })}
                </span>
                <button
                  type="button"
                  onClick={() => setView('calendar')}
                  className="p-2 rounded-lg hover:bg-neutral-100"
                  aria-label="Ver calendario"
                >
                  <Calendar className="w-5 h-5 text-neutral-700" />
                </button>
              </div>

              {/* Lista de horarios */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {grouped.map(([dateLabel, dateSlots]) => (
                  <div key={dateLabel}>
                    <p className="text-sm font-semibold text-neutral-900 mb-2">{dateLabel}</p>
                    <div className="space-y-2">
                      {dateSlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => handleSlotClick(slot)}
                          className="w-full text-left rounded-xl border border-[#EBEBEB] bg-white p-4 hover:border-black hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="text-base font-medium text-neutral-900">{slot.timeRange}</p>
                              <p className="text-sm text-neutral-500 mt-0.5">
                                {formatPrice(pricePerParticipant, currency)} por persona
                              </p>
                              <p className="text-xs text-neutral-400 mt-0.5">
                                Precios para experiencias privadas disponibles
                              </p>
                            </div>
                            <span className="text-sm text-neutral-500 whitespace-nowrap">
                              {slot.spotsLeft} cupos disponibles
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Vista calendario */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                <span className="text-sm font-medium text-neutral-900 capitalize">
                  {format(calendarMonth, 'MMMM yyyy', { locale: es })}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setCalendarMonth((m) => addMonths(m, -1))}
                    className="p-2 rounded-lg hover:bg-neutral-100 text-sm"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarMonth((m) => addMonths(m, 1))}
                    className="p-2 rounded-lg hover:bg-neutral-100 text-sm"
                  >
                    →
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-neutral-500 mb-2">
                  {['L', 'Ma', 'Mi', 'J', 'V', 'S', 'D'].map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {gridDays.map((day, i) => {
                    if (day === null)
                      return <div key={`pad-${i}`} className="aspect-square" />
                    const isPast = day < new Date() && !isSameDay(day, new Date())
                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        disabled={isPast}
                        className={`aspect-square rounded-lg text-sm font-medium flex items-center justify-center ${
                          isPast ? 'text-neutral-300' : 'text-neutral-900 hover:bg-neutral-100'
                        }`}
                      >
                        {format(day, 'd')}
                      </button>
                    )
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => setView('slots')}
                  className="mt-4 w-full py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
                >
                  Volver a horarios
                </button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
