'use client'

import { serviceCategories } from '@/components/services/data'

interface ServiceTypeInputProps {
  value: string | null
  onChange: (value: string | null) => void
}

export function ServiceTypeInput({ value, onChange }: ServiceTypeInputProps) {
  return (
    <div className="p-4 pb-5 bg-white overflow-y-auto max-h-[420px]">
      <h3 className="text-xs font-semibold text-secondary mb-3">Tipo de servicio</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {serviceCategories.map((category) => {
          const selected = category.id === value
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onChange(selected ? null : category.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                selected
                  ? 'bg-secondary text-white border-secondary'
                  : 'bg-white text-secondary border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <img
                src={category.imageUrl}
                alt=""
                className="h-8 w-8 shrink-0 rounded-lg object-cover"
              />
              <span className="truncate">{category.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

