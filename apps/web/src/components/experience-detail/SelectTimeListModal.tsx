'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Minus, Plus, X } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ExperienceSlot } from './ExperienceBookingCard'

interface SelectTimeListModalProps {
  isOpen: boolean
  onClose: () => void
  experienceTitle: string
  slots: ExperienceSlot[]
  pricePerParticipant: number
  currency: string
  onSelectSlot: (slot: ExperienceSlot, adults: number, children: number) => void
}

function formatPrice(value: number, currency: string) {
  if (currency === 'COP') return `$${value.toLocaleString('es-CO')} COP`
  return `${value.toLocaleString()} ${currency}`
}

export default function SelectTimeListModal({
  isOpen,
  onClose,
  experienceTitle,
  slots,
  pricePerParticipant,
  currency,
  onSelectSlot,
}: SelectTimeListModalProps) {
  const [adults, setAdults] = useState(1)
  const [children] = useState(0)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)

  const groupedSlots = useMemo(() => {
    const map = new Map<string, { label: string; items: ExperienceSlot[] }>()
    for (const slot of slots) {
      const dateKey = slot.date ?? slot.dateLabel ?? ''
      const d =
        slot.date && !Number.isNaN(Date.parse(slot.date))
          ? new Date(slot.date)
          : null
      const prettyLabel =
        d != null
          ? format(d, "EEEE d 'de' MMMM", { locale: es })
          : slot.dateLabel ?? ''

      if (!map.has(dateKey)) {
        map.set(dateKey, { label: prettyLabel, items: [] })
      }
      map.get(dateKey)!.items.push(slot)
    }
    return Array.from(map.values())
  }, [slots])

  const handleConfirm = () => {
    if (!selectedSlotId) return
    const all = groupedSlots.flatMap((g) => g.items)
    const slot = all.find((s) => s.id === selectedSlotId)
    if (!slot) return
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
        className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/50 px-3 py-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-[520px] max-h-[70vh] bg-white rounded-3xl shadow-xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2.5 border-b border-neutral-200">
            <h2 className="text-base font-semibold text-[#222222]">
              Selecciona una hora
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-700"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Resumen de viajeros */}
          <div className="px-5 pb-3 pt-2.5 border-b border-neutral-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[13px] text-[#222222] font-medium">
                {adults} {adults === 1 ? 'adulto' : 'adultos'}
              </span>
              <button
                type="button"
                className="text-xs text-[#008489] hover:underline text-left"
              >
                Agregar niños
              </button>
            </div>
            <div className="inline-flex items-center gap-1.5 border border-neutral-300 rounded-full px-2.5 py-0.5">
              <button
                type="button"
                onClick={() => setAdults((n) => Math.max(1, n - 1))}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-100"
                aria-label="Menos adultos"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-[13px] font-medium text-[#222222] min-w-[1.5rem] text-center">
                {adults}
              </span>
              <button
                type="button"
                onClick={() => setAdults((n) => n + 1)}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-neutral-100"
                aria-label="Más adultos"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Contenido scrollable: lista de fechas y horarios */}
          <div className="flex-1 overflow-y-auto px-5 pb-2 pt-2 space-y-4">
            {groupedSlots.length === 0 ? (
              <p className="text-sm text-neutral-500 mt-2">
                No hay horarios disponibles por ahora para esta experiencia.
              </p>
            ) : (
              groupedSlots.map((group, idx) => (
                <section key={`${group.label}-${idx}`} className="space-y-1.5">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                    {group.label}
                  </h3>
                  <div className="space-y-1.5">
                    {group.items.map((slot) => {
                      const isSelected = selectedSlotId === slot.id
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`w-full text-left rounded-2xl border px-3.5 py-2.5 transition-colors ${
                            isSelected
                              ? 'border-[#222222] bg-neutral-50'
                              : 'border-neutral-200 bg-white hover:border-neutral-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="space-y-0.5">
                              <p className="text-[13px] font-semibold text-[#222222]">
                                {slot.timeRange}
                              </p>
                              <p className="text-[11px] text-neutral-600">
                                {formatPrice(pricePerParticipant, currency)} por
                                persona
                              </p>
                            </div>
                            <p className="text-[11px] text-neutral-600 whitespace-nowrap">
                              {slot.spotsLeft}{' '}
                              {slot.spotsLeft === 1
                                ? 'cupo disponible'
                                : 'cupos disponibles'}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </section>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-neutral-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[13px] text-neutral-700">
              <Calendar className="w-4 h-4" />
              <span className="truncate" title={experienceTitle}>
                {experienceTitle}
              </span>
            </div>
            <button
              type="button"
              disabled={!selectedSlotId}
              onClick={handleConfirm}
              className="px-4 py-2 rounded-lg bg-[#FF385C] text-white text-sm font-semibold hover:bg-[#E31C5F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

