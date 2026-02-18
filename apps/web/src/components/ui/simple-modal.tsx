'use client'

import { X } from 'lucide-react'

interface SimpleModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'md' | 'lg' | 'xl'
}

const sizeClasses = { md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-4xl' }

export function SimpleModal({ open, onClose, title, children, size = 'md' }: SimpleModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div className={`relative z-10 w-full ${sizeClasses[size]} mx-4 max-h-[90vh] overflow-hidden bg-white rounded-xl shadow-lg p-6`}>
        <div className="flex items-center justify-between mb-4">
          {title ? <h2 className="text-lg font-semibold">{title}</h2> : <span />}
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-3rem)]">{children}</div>
      </div>
    </div>
  )
}
