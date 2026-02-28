'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'

interface ImageCarouselModalProps {
  images: string[]
  initialIndex: number
  isOpen: boolean
  onClose: () => void
  title: string
}

const SWIPE_THRESHOLD = 50
const DRAG_VELOCITY_THRESHOLD = 300

export default function ImageCarouselModal({
  images,
  initialIndex,
  isOpen,
  onClose,
  title,
}: ImageCarouselModalProps) {
  // Solo usar URLs válidas (no vacías)
  const validImages = images.filter(
    (url) => typeof url === 'string' && url.trim() !== ''
  )
  const safeInitialIndex = Math.max(
    0,
    Math.min(initialIndex, validImages.length - 1)
  )
  const [currentIndex, setCurrentIndex] = useState(safeInitialIndex)

  useEffect(() => {
    setCurrentIndex(safeInitialIndex)
  }, [isOpen, safeInitialIndex])

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? validImages.length - 1 : prev - 1
    )
  }, [validImages.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === validImages.length - 1 ? 0 : prev + 1
    )
  }, [validImages.length])

  // Arrastre / swipe (mouse y touch) con Framer Motion
  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const { offset, velocity } = info
      if (Math.abs(offset.x) >= SWIPE_THRESHOLD || Math.abs(velocity.x) >= DRAG_VELOCITY_THRESHOLD) {
        if (offset.x > 0 || velocity.x > 0) handlePrevious()
        else handleNext()
      }
    },
    [handleNext, handlePrevious]
  )

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const handleArrow = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevious()
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      }
    }
    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleArrow)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleArrow)
      document.body.style.overflow = ''
    }
  }, [isOpen, handlePrevious, handleNext, onClose])

  if (!isOpen || validImages.length === 0) return null

  const currentImage = validImages[currentIndex]
  if (!currentImage) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="fixed inset-0 z-[100] bg-black/90"
        onClick={onClose}
      >
        {/* Barra superior */}
        <div className="absolute top-0 left-0 right-0 z-[110] flex items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              // TODO: Implementar descarga
            }}
            className="p-2 rounded-full hover:bg-white/10 transition-colors duration-150 ease-out"
            aria-label="Descargar imagen"
          >
            <Download className="w-5 h-5 text-white" strokeWidth={1.5} />
          </button>
          <span className="text-sm font-medium text-white">
            {currentIndex + 1} de {validImages.length}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="p-2 rounded-full hover:bg-white/10 transition-colors duration-150 ease-out"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-white" strokeWidth={1.5} />
          </button>
        </div>

        {/* Imagen central - arrastre y swipe */}
        <div className="flex items-center justify-center h-full px-16">
          <motion.div
            key={currentIndex}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full h-full max-w-7xl max-h-[90vh] cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            style={{ touchAction: 'pan-y' }}
          >
            <Image
              src={currentImage}
              alt={`${title} - Imagen ${currentIndex + 1}`}
              fill
              className="object-contain rounded-xl pointer-events-none"
              sizes="90vw"
              priority={currentIndex === initialIndex}
              draggable={false}
            />
          </motion.div>
        </div>

        {/* Flechas de navegación - z-[110] para estar siempre encima */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handlePrevious()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-[110] p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all duration-150 ease-out hover:scale-110 border border-white/20"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-[110] p-3 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all duration-150 ease-out hover:scale-110 border border-white/20"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="w-6 h-6 text-white" strokeWidth={2} />
            </button>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
