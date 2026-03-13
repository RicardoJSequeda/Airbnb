'use client'

import React from 'react'
import { 
  X, 
  Mountain, 
  Camera, 
  Music, 
  Coffee, 
  Landmark, 
  Soup, 
  Globe, 
  BookOpen, 
  PawPrint, 
  Building, 
  Footprints, 
  ChefHat, 
  Wine, 
  ShoppingBag, 
  Activity, 
  Binoculars,
  Check
} from 'lucide-react'

interface Interest {
  id: string
  label: string
  icon: React.ReactNode
}

const ALL_INTERESTS: Interest[] = [
  { id: 'nature', label: 'la naturaleza', icon: <Mountain size={20} /> },
  { id: 'photography', label: 'Fotografía', icon: <Camera size={20} /> },
  { id: 'music', label: 'Música en vivo', icon: <Music size={20} /> },
  { id: 'coffee', label: 'Café', icon: <Coffee size={20} /> },
  { id: 'museums', label: 'Museos', icon: <Landmark size={20} /> },
  { id: 'gastronomy', label: 'Escenas gastronómicas', icon: <Soup size={20} /> },
  { id: 'history', label: 'Historia', icon: <Globe size={20} /> },
  { id: 'reading', label: 'Lectura', icon: <BookOpen size={20} /> },
  { id: 'animals', label: 'Animales', icon: <PawPrint size={20} /> },
  { id: 'architecture', label: 'Arquitectura', icon: <Building size={20} /> },
  { id: 'walk', label: 'Caminata', icon: <Footprints size={20} /> },
  { id: 'cooking', label: 'Cocina', icon: <ChefHat size={20} /> },
  { id: 'wine', label: 'Vino', icon: <Wine size={20} /> },
  { id: 'shopping', label: 'Compras', icon: <ShoppingBag size={20} /> },
  { id: 'dance', label: 'Baile', icon: <Activity size={20} /> },
  { id: 'culture', label: 'Cultura local', icon: <Binoculars size={20} /> },
]

interface InterestsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (interests: string[]) => Promise<void>
  initialInterests: string[]
}

export function InterestsModal({
  isOpen,
  onClose,
  onSave,
  initialInterests,
}: InterestsModalProps) {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (isOpen) {
      // Map initial labels back to IDs if needed, or assume labels are IDs for now
      // In a real app we'd store IDs, but here the user provided labels in screens
      const selected = ALL_INTERESTS
        .filter(i => initialInterests.includes(i.label))
        .map(i => i.id)
      setSelectedIds(selected)
    }
  }, [initialInterests, isOpen])

  if (!isOpen) return null

  const toggleInterest = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : prev.length < 20 ? [...prev, id] : prev
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const selectedLabels = ALL_INTERESTS
        .filter(i => selectedIds.includes(i.id))
        .map(i => i.label)
      await onSave(selectedLabels)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-[24px] w-full max-w-[568px] flex flex-col max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-400 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center border-b border-transparent">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pt-2 pb-6 flex-1 overflow-y-auto">
          <h2 className="text-[26px] font-semibold text-neutral-900 leading-tight mb-2 tracking-tight">
            ¿Cuáles son tus intereses?
          </h2>
          <p className="text-base text-neutral-500 mb-8 leading-relaxed">
            Elige algunos intereses que disfrutes y que quieras mostrar en tu perfil.
          </p>

          <div className="flex flex-wrap gap-3">
            {ALL_INTERESTS.map((interest) => {
              const isSelected = selectedIds.includes(interest.id)
              return (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-full border transition-all duration-200 ${
                    isSelected 
                      ? 'border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900' 
                      : 'border-neutral-300 hover:border-black'
                  }`}
                >
                  <span className="text-neutral-700">{interest.icon}</span>
                  <span className="text-base font-normal text-neutral-900">{interest.label}</span>
                </button>
              )
            })}
          </div>

          <button className="mt-6 text-base font-semibold underline text-neutral-900 hover:text-black transition-colors">
            Mostrar todo
          </button>
        </div>

        <div className="px-8 py-5 border-t border-neutral-200 flex items-center justify-between bg-white">
          <span className="text-[15px] font-semibold text-neutral-900">
            {selectedIds.length}/20 seleccionados
          </span>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-neutral-800 hover:bg-black text-white px-8 py-3 rounded-lg font-semibold transition-all active:scale-95 disabled:opacity-50 shadow-sm"
          >
            {isSaving ? 'Guardando...' : 'Guarda'}
          </button>
        </div>
      </div>
    </div>
  )
}
