'use client'

import { X } from 'lucide-react'

type ModalOverlayProps = {
  children: React.ReactNode
  onClose: () => void
  /** Id del título para accesibilidad */
  titleId?: string
  /** Clases del panel (contenedor blanco) */
  panelClassName?: string
}

export function ModalOverlay({
  children,
  onClose,
  titleId,
  panelClassName = 'relative w-full max-w-[440px] mx-4 rounded-2xl bg-white shadow-2xl overflow-hidden',
}: ModalOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div className={panelClassName} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  )
}
