'use client'

import {
  Camera,
  UtensilsCrossed,
  HandHeart,
  Salad,
  Dumbbell,
  Brush,
  Scissors,
  Sparkles,
  Sandwich,
} from 'lucide-react'
import { serviceCategories } from '@/components/services/data'

interface ServiceTypeInputProps {
  value: string | null
  onChange: (value: string | null) => void
}

const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  fotografia: Camera,
  chefs: UtensilsCrossed,
  masaje: HandHeart,
  comidas: Salad,
  entrenamiento: Dumbbell,
  maquillaje: Brush,
  cabello: Scissors,
  spa: Sparkles,
  catering: Sandwich,
  unas: Sparkles,
}

export function ServiceTypeInput({ value, onChange }: ServiceTypeInputProps) {
  return (
    <div className="p-4 pb-5 bg-white overflow-y-auto max-h-[420px]">
      <h3 className="text-xs font-semibold text-secondary mb-3">Tipo de servicio</h3>
      <div className="flex flex-wrap gap-3">
        {serviceCategories.map((category) => {
          const selected = category.id === value
          const Icon = SERVICE_ICONS[category.id] ?? Sparkles

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(selected ? null : category.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                selected
                  ? 'bg-secondary text-white border-secondary shadow-sm'
                  : 'bg-white text-secondary border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                  selected ? 'border-white bg-secondary/20' : 'border-gray-300 bg-white'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="truncate">{category.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

