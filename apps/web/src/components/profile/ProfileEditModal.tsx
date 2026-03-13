'use client'

import React from 'react'
import { X } from 'lucide-react'

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (value: string) => Promise<void>
  title: string
  description: string
  label: string
  initialValue: string
  charLimit: number
}

export function ProfileEditModal({
  isOpen,
  onClose,
  onSave,
  title,
  description,
  label,
  initialValue,
  charLimit,
}: ProfileEditModalProps) {
  const [value, setValue] = React.useState(initialValue)
  const [isSaving, setIsSaving] = React.useState(false)

  React.useEffect(() => {
    if (isOpen) {
      setValue(initialValue || '')
    }
  }, [initialValue, isOpen])

  if (!isOpen) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(value)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const charsRemaining = charLimit - value.length

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div 
        className="bg-white rounded-[24px] w-full max-w-[568px] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-400 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center">
          <button 
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 pt-2 pb-8">
          <h2 className="text-[26px] font-semibold text-neutral-900 leading-tight mb-4 tracking-tight">
            {title}
          </h2>
          <p className="text-base text-neutral-600 mb-8 leading-relaxed max-w-[480px]">
            {description}
          </p>

          <div className="relative">
            <div className="w-full border border-neutral-400 rounded-xl p-4 focus-within:ring-2 focus-within:ring-black focus-within:border-black transition-all">
              <label className="block text-neutral-500 text-sm mb-1 font-normal">
                {label}
              </label>
              <textarea
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value.slice(0, charLimit))}
                className="w-full min-h-[80px] text-lg text-neutral-900 bg-transparent outline-none resize-none placeholder:text-neutral-300"
                placeholder="..."
              />
            </div>
            <div className="mt-2 flex justify-end">
              <span className="text-[13px] font-semibold text-neutral-500">
                {charsRemaining} caracteres disponibles
              </span>
            </div>
          </div>
        </div>

        <div className="px-8 py-5 border-t border-neutral-200 flex justify-end bg-white">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-neutral-900 hover:bg-black text-white px-8 py-3 rounded-lg font-semibold transition-all active:scale-95 disabled:opacity-50 shadow-sm"
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
