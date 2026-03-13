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
  Sparkles
} from 'lucide-react'
import { apiClient } from '@/lib/api/client'

interface Interest {
  id: string
  label: string
  icon: string
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Mountain: <Mountain size={18} />,
  Camera: <Camera size={18} />,
  Music: <Music size={18} />,
  Coffee: <Coffee size={18} />,
  Landmark: <Landmark size={18} />,
  Soup: <Soup size={18} />,
  Globe: <Globe size={18} />,
  BookOpen: <BookOpen size={18} />,
  PawPrint: <PawPrint size={18} />,
  Building: <Building size={18} />,
  Footprints: <Footprints size={18} />,
  ChefHat: <ChefHat size={18} />,
  Wine: <Wine size={18} />,
  ShoppingBag: <ShoppingBag size={18} />,
  Activity: <Activity size={18} />,
  Binoculars: <Binoculars size={18} />,
}

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
  const [interests, setInterests] = React.useState<Interest[]>([])
  const [selectedLabels, setSelectedLabels] = React.useState<string[]>([])
  const [isSaving, setIsSaving] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (isOpen) {
      const fetchInterests = async () => {
        try {
          setIsLoading(true)
          const response = await apiClient.get<Interest[]>('/interests')
          setInterests(response.data)
        } catch (error) {
          console.error('Error fetching interests:', error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchInterests()
      setSelectedLabels(initialInterests)
    }
  }, [initialInterests, isOpen])

  if (!isOpen) return null

  const toggleInterest = (label: string) => {
    setSelectedLabels(prev => 
      prev.includes(label) 
        ? prev.filter(i => i !== label) 
        : prev.length < 20 ? [...prev, label] : prev
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(selectedLabels)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-[1px] animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-[20px] w-full max-w-[420px] flex flex-col max-h-[80vh] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-2.5 flex items-center border-b border-neutral-100">
          <button 
            onClick={onClose}
            className="p-1 px-2 hover:bg-neutral-100 rounded-lg transition-colors active:scale-95"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-4 flex-1 overflow-y-auto scrollbar-hide">
          <h2 className="text-[18px] font-bold text-neutral-900 leading-tight mb-1 tracking-tight">
            ¿Cuáles son tus intereses?
          </h2>
          <p className="text-[13px] text-neutral-500 mb-5 font-normal">
            Elige intereses que quieras mostrar en tu perfil.
          </p>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-800" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {interests.map((interest) => {
                const isSelected = selectedLabels.includes(interest.label)
                return (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.label)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 text-left ${
                      isSelected 
                        ? 'border-neutral-900 bg-neutral-50 ring-[0.5px] ring-neutral-900' 
                        : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <span className="text-neutral-700 shrink-0">
                      {ICON_MAP[interest.icon] || <Sparkles size={16} />}
                    </span>
                    <span className="text-[12px] font-medium text-neutral-900 truncate">
                      {interest.label}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-neutral-100 flex items-center justify-between bg-white">
          <span className="text-[12px] font-medium text-neutral-400">
            {selectedLabels.length}/20 seleccionados
          </span>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="bg-neutral-900 hover:bg-black text-white px-5 py-2 rounded-lg text-[13px] font-semibold transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? 'Guardando...' : 'Guarda'}
          </button>
        </div>
      </div>
    </div>
  )
}
