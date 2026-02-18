'use client'

import { useState } from 'react'
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { es as dayPickerEs } from 'react-day-picker/locale'

type DateType = 'today' | 'tomorrow' | 'weekend' | 'specific'

interface ExperienceDatePickerProps {
  value?: {
    type: DateType
    date?: Date
    time?: string
  }
  onChange: (value: { type: DateType; date?: Date; time?: string }) => void
  onClose?: () => void
}

export default function ExperienceDatePicker({
  value,
  onChange,
  onClose,
}: ExperienceDatePickerProps) {
  const [selectedType, setSelectedType] = useState<DateType>(value?.type || 'today')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value?.date)
  const [selectedTime, setSelectedTime] = useState<string>(value?.time || '')

  const today = new Date()
  const tomorrow = addDays(today, 1)
  const weekendStart = startOfWeek(addDays(today, 1), { weekStartsOn: 5 }) // Viernes
  const weekendEnd = endOfWeek(addDays(today, 1), { weekStartsOn: 5 }) // Domingo

  const handleTypeSelect = (type: DateType) => {
    setSelectedType(type)
    let date: Date | undefined
    if (type === 'today') date = today
    else if (type === 'tomorrow') date = tomorrow
    else if (type === 'weekend') date = weekendStart
    else date = selectedDate

    onChange({ type, date, time: selectedTime })
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    onChange({ type: 'specific', date, time: selectedTime })
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    onChange({ type: selectedType, date: selectedDate || today, time })
  }

  const getQuickDateLabel = (type: DateType) => {
    switch (type) {
      case 'today':
        return format(today, 'd MMM', { locale: es })
      case 'tomorrow':
        return format(tomorrow, 'd MMM', { locale: es })
      case 'weekend':
        return `${format(weekendStart, 'd', { locale: es })}-${format(weekendEnd, 'd MMM', { locale: es })}`
      default:
        return ''
    }
  }

  const timeSlots = [
    '8:00', '9:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00',
  ]

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl">
      <div className="flex flex-col md:flex-row">
        {/* Panel izquierdo: Opciones rápidas */}
        <div className="w-full md:w-64 border-r border-gray-200 p-6 space-y-3">
          <h3 className="font-semibold text-secondary mb-4">Selecciona una fecha</h3>
          
          <button
            onClick={() => handleTypeSelect('today')}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selectedType === 'today'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-secondary">Hoy</div>
            <div className="text-sm text-gray-500 mt-1">{getQuickDateLabel('today')}</div>
          </button>

          <button
            onClick={() => handleTypeSelect('tomorrow')}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selectedType === 'tomorrow'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-secondary">Mañana</div>
            <div className="text-sm text-gray-500 mt-1">{getQuickDateLabel('tomorrow')}</div>
          </button>

          <button
            onClick={() => handleTypeSelect('weekend')}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selectedType === 'weekend'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="font-semibold text-secondary">Este fin de semana</div>
            <div className="text-sm text-gray-500 mt-1">{getQuickDateLabel('weekend')}</div>
          </button>
        </div>

        {/* Panel derecho: Calendario */}
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h3 className="font-semibold text-secondary mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Selecciona una fecha específica
            </h3>
            <DayPicker
              mode="single"
              selected={selectedType === 'specific' ? selectedDate : undefined}
              onSelect={handleDateSelect}
              locale={dayPickerEs}
              disabled={(date) => date < today}
              className="w-full"
            />
          </div>

          {/* Selector de hora */}
          {selectedType !== 'weekend' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-secondary mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Selecciona una hora
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedTime === time
                        ? 'border-primary bg-primary/5 text-primary font-semibold'
                        : 'border-gray-200 hover:border-gray-300'
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
