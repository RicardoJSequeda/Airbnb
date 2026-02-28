'use client'

/**
 * Selector de fechas: presets + calendario. Estilo premium neutro (tipo Airbnb).
 * Sin lógica de dominio; todo viene de dateAndTimeConfig.
 */
import { useMemo, useState, useEffect } from 'react'
import { startOfMonth, startOfDay } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { es as dayPickerEs } from 'react-day-picker/locale'
import type { ExperienceDateValue } from '@/config/search'
import type { SearchDateAndTimeConfig } from '@/config/search'

interface ExperienceDatePickerProps {
  value: ExperienceDateValue | null | undefined
  onChange: (value: ExperienceDateValue | null) => void
  onClose?: () => void
  dateAndTimeConfig?: SearchDateAndTimeConfig
  referenceDate?: Date
}

const monthTransition = { duration: 0.2, ease: 'easeOut' as const }

export default function ExperienceDatePicker({
  value,
  onChange,
  dateAndTimeConfig,
  referenceDate = new Date(),
}: ExperienceDatePickerProps) {
  const ref = useMemo(
    () => new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate()),
    [referenceDate]
  )
  const selectedType = value?.type ?? 'today'
  const selectedTime = value?.time ?? ''
  const selectedDate = value?.date

  const [displayedMonth, setDisplayedMonth] = useState(() =>
    startOfMonth(selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1) : ref)
  )
  useEffect(() => {
    if (selectedDate) {
      setDisplayedMonth(startOfMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)))
    }
  }, [selectedDate?.getTime()])

  const handlePresetSelect = (presetId: 'today' | 'tomorrow' | 'weekend') => {
    const preset = dateAndTimeConfig?.presets.find((p) => p.id === presetId)
    if (!preset) return
    const date = preset.resolveDate(ref)
    onChange({ type: presetId, date, time: selectedTime || undefined })
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    onChange({ type: 'specific', date, time: selectedTime || undefined })
  }

  const showTimeBlock = dateAndTimeConfig?.showTimeSelection === true && selectedType !== 'weekend'

  const monthLabel = (() => {
    const raw = displayedMonth.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    return raw.charAt(0).toUpperCase() + raw.slice(1)
  })()

  return (
    <div
      className="bg-white rounded-[32px] p-8 shadow-[0_16px_40px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out overflow-hidden max-w-4xl"
      role="dialog"
      aria-label="Seleccionar fecha"
    >
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-12">
        {dateAndTimeConfig?.presets && dateAndTimeConfig.presets.length > 0 && (
          <div className="w-full min-w-0">
            {dateAndTimeConfig.panelTitle ? (
              <h2 className="text-base font-semibold text-neutral-900 mb-4">
                {dateAndTimeConfig.panelTitle}
              </h2>
            ) : null}
            <div className="space-y-4">
              {dateAndTimeConfig.presets.map((preset) => {
                const isSelected = selectedType === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset.id as 'today' | 'tomorrow' | 'weekend')}
                    className={`w-full text-left rounded-2xl border px-6 py-5 transition-colors duration-150 ${
                      isSelected
                        ? 'bg-neutral-100 border-neutral-300'
                        : 'bg-white border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="text-base font-semibold text-neutral-900">{preset.mainLabel}</div>
                    <div className="text-sm text-neutral-500 mt-1">{preset.getSubLabel(ref)}</div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="min-w-0 flex flex-col justify-center pl-2">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold tracking-[-0.2px] leading-tight text-neutral-900">
              {monthLabel}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1))}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 active:scale-95 transition-transform duration-100"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="w-5 h-5 text-neutral-700" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={() => setDisplayedMonth(new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1))}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-100 active:scale-95 transition-transform duration-100"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="w-5 h-5 text-neutral-700" strokeWidth={2} />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={displayedMonth.getTime()}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={monthTransition}
              className="w-full"
            >
              <DayPicker
                mode="single"
                month={displayedMonth}
                onMonthChange={setDisplayedMonth}
                selected={selectedDate ?? undefined}
                onSelect={handleCalendarSelect}
                locale={dayPickerEs}
                disabled={(date) => startOfDay(date).getTime() < startOfDay(new Date()).getTime()}
                className="w-full"
                showOutsideDays
                hideNavigation
                labels={{
                  labelPrevious: () => 'Mes anterior',
                  labelNext: () => 'Mes siguiente',
                }}
                classNames={{
                  root: 'w-full',
                  month: 'flex flex-col w-full',
                  month_caption: 'hidden',
                  month_grid: 'flex flex-col gap-y-3 w-full',
                  weekdays: 'flex mb-4',
                  weekday: 'w-10 text-center text-xs text-neutral-500 font-medium',
                  week: 'flex gap-x-2',
                  day: 'w-10 h-10 text-sm',
                  day_button:
                    'w-10 h-10 flex items-center justify-center rounded-full text-neutral-900 hover:bg-neutral-100 hover:scale-[1.04] transition-transform duration-150 font-normal data-[selected]:bg-neutral-900 data-[selected]:text-white data-[selected]:font-medium data-[selected]:animate-[scale-in_0.15s_ease-out] data-[disabled]:hover:bg-transparent data-[disabled]:hover:scale-100',
                  selected: '!bg-neutral-900 !text-white font-medium',
                  disabled:
                    'text-neutral-400 cursor-not-allowed bg-neutral-100/80 opacity-70 pointer-events-none select-none',
                  today: 'font-semibold',
                  outside: 'text-neutral-400 opacity-60',
                  hidden: 'invisible',
                }}
              />
            </motion.div>
          </AnimatePresence>

          {showTimeBlock && dateAndTimeConfig?.timeSlots && dateAndTimeConfig.timeSlots.length > 0 && (
            <div className="pt-6 mt-6 border-t border-neutral-200">
              <h3 className="text-base font-semibold text-neutral-900 mb-3">
                {dateAndTimeConfig.timePanelTitle}
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {dateAndTimeConfig.timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      const preset = dateAndTimeConfig?.presets?.[0]
                      const currentDate =
                        value?.date ?? (preset ? preset.resolveDate(ref) : ref)
                      onChange({
                        type: selectedType,
                        date: currentDate,
                        time,
                      })
                    }}
                    className={`p-2.5 rounded-xl border text-sm transition-colors duration-150 ${
                      value?.time === time
                        ? 'bg-neutral-100 border-neutral-300 font-semibold text-neutral-900'
                        : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
