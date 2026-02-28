'use client'

/** Controlled por modo (range | single). Sin condicionales por variante. */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { es as dayPickerEs } from 'react-day-picker/locale'
import type { DateRange } from 'react-day-picker'
import { DayPicker } from 'react-day-picker'
import ExperienceDatePicker from './ExperienceDatePicker'
import { startOfDay } from 'date-fns'
import type {
  DateMode,
  DateRangeValue,
  ExperienceDateValue,
  SearchDateAndTimeConfig,
} from '@/config/search'

const panelContentTransition = { duration: 0.18, ease: [0.22, 0.61, 0.36, 1] as const }
type DateTab = 'dates' | 'months' | 'flexible'

interface DateInputProps {
  dateMode: DateMode
  dateRange?: DateRangeValue
  experienceDate?: ExperienceDateValue | null
  onDateRangeChange: (range: DateRangeValue) => void
  onExperienceDateChange: (value: ExperienceDateValue | null) => void
  onClose?: () => void
  dateAndTimeConfig?: SearchDateAndTimeConfig
  referenceDate?: Date
}

export function DateInput({
  dateMode,
  dateRange,
  experienceDate,
  onDateRangeChange,
  onExperienceDateChange,
  onClose,
  dateAndTimeConfig,
  referenceDate,
}: DateInputProps) {
  const [dateTab, setDateTab] = useState<DateTab>('dates')
  const [flexibleDuration, setFlexibleDuration] = useState<'weekend' | 'week' | 'month' | null>(null)
  const [flexibleMonth, setFlexibleMonth] = useState<Date | null>(null)
  const [monthsDuration, setMonthsDuration] = useState(1)

  if (dateMode === null) return null

  if (dateMode === 'single') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <ExperienceDatePicker
          value={experienceDate ?? undefined}
          onChange={(v) => onExperienceDateChange(v ?? null)}
          onClose={onClose}
          dateAndTimeConfig={dateAndTimeConfig}
          referenceDate={referenceDate ?? new Date()}
        />
      </motion.div>
    )
  }

  const today = startOfDay(new Date())

  return (
    <motion.div
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
          selected={dateRange as DateRange}
          onSelect={(range) => onDateRangeChange(range)}
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
            day_button: 'w-full h-full rounded-full hover:bg-gray-100 transition-colors data-[disabled]:hover:bg-transparent',
            selected: 'bg-gray-900 text-white hover:bg-gray-900',
            range_start: 'bg-gray-900 text-white rounded-l-full',
            range_end: 'bg-gray-900 text-white rounded-r-full',
            range_middle: 'bg-gray-100',
            disabled:
              'text-gray-400 bg-gray-100/90 opacity-70 cursor-not-allowed pointer-events-none select-none',
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
                onClick={() => setFlexibleDuration(flexibleDuration === o.id ? null : o.id)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                  flexibleDuration === o.id ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 hover:border-gray-900'
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
                    flexibleMonth?.getMonth() === d.getMonth() ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <span className="text-sm font-medium">{d.toLocaleDateString('es', { month: 'long' })}</span>
                  <span className="text-xs text-gray-500">{d.getFullYear()}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}
