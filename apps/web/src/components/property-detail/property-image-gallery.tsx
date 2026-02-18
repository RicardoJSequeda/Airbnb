'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Grid3X3, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface PropertyImageGalleryProps {
  images: string[]
  title: string
}

export default function PropertyImageGallery({ images, title }: PropertyImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [carouselIndex, setCarouselIndex] = useState(0)

  const total = images.length

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => setLightboxOpen(false)

  const goPrev = useCallback(() => {
    setLightboxIndex((i) => (i > 0 ? i - 1 : total - 1))
  }, [total])

  const goNext = useCallback(() => {
    setLightboxIndex((i) => (i < total - 1 ? i + 1 : 0))
  }, [total])

  useEffect(() => {
    if (!lightboxOpen) return
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [lightboxOpen, goPrev, goNext])

  if (images.length === 0) {
    return (
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">Sin imágenes</span>
      </div>
    )
  }

  const thumbnails = images.slice(0, 5)
  const rightImages = thumbnails.length > 1
    ? Array.from({ length: 4 }, (_, i) => thumbnails[Math.min(i + 1, thumbnails.length - 1)])
    : []
  const showOverlay = total > 1
  const singleImage = thumbnails.length <= 1

  return (
    <>
      {/* Desktop: 5 fotos como referencia - 1 grande izquierda, 4 en grid derecha */}
      <div className={`hidden md:grid gap-2 rounded-2xl overflow-hidden h-[450px] lg:h-[500px] ${
        singleImage ? 'grid-cols-1' : 'grid-cols-4 grid-rows-2'
      }`}>
        {/* Imagen principal - ocupa toda la izquierda (o todo si solo hay 1) */}
        <div
          className={`relative overflow-hidden bg-gray-100 cursor-pointer ${
            singleImage ? 'rounded-2xl' : 'col-span-2 row-span-2 rounded-l-2xl'
          }`}
          onClick={() => openLightbox(0)}
        >
          <Image
            src={images[0]}
            alt={`${title} 1`}
            fill
            className="object-cover"
            sizes="50vw"
            priority
          />
        </div>
        {/* 4 imágenes pequeñas en grid 2x2 */}
        {rightImages.map((src, i) => {
          const isLast = i === 3
          const hasOverlay = isLast && showOverlay
          return (
            <div
              key={i}
              className={`relative overflow-hidden cursor-pointer ${
                i === 0 ? 'rounded-tr-2xl' : ''
              } ${i === 3 ? 'rounded-br-2xl' : ''}`}
              onClick={(e) => {
                if (hasOverlay) {
                  e.stopPropagation()
                  openLightbox(0)
                } else {
                  openLightbox(Math.min(i + 1, total - 1))
                }
              }}
            >
              <Image
                src={src}
                alt={`${title} ${i + 2}`}
                fill
                className="object-cover"
                sizes="25vw"
              />
              {hasOverlay && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openLightbox(0)
                  }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-medium hover:bg-black/60 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Grid3X3 className="w-5 h-5" />
                    Mostrar todas las fotos
                  </span>
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: carrusel deslizable */}
      <div className="md:hidden relative rounded-2xl overflow-hidden">
        <div
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth h-[400px] scrollbar-hide"
          style={{ WebkitOverflowScrolling: 'touch' }}
          onScroll={(e) => {
            const el = e.target as HTMLDivElement
            const idx = Math.round(el.scrollLeft / el.clientWidth)
            setCarouselIndex(Math.min(idx, total - 1))
          }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-full snap-start relative h-full min-w-full"
            >
              <Image
                src={src}
                alt={`${title} ${i + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
                onClick={() => openLightbox(i)}
              />
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-white/90 rounded-lg shadow-md text-sm font-medium">
          {carouselIndex + 1} de {total}
        </div>
        {total > 1 && (
          <button
            onClick={() => openLightbox(carouselIndex)}
            className="absolute bottom-4 right-4 px-3 py-2 bg-white rounded-lg shadow-md flex items-center gap-2 text-sm font-medium"
          >
            <Grid3X3 className="w-4 h-4" />
            Mostrar todas
          </button>
        )}
      </div>

      {/* Lightbox con flechas y teclado */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full z-10"
            aria-label="Cerrar (Escape)"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-full z-10"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <div className="relative w-full max-w-5xl h-[80vh] mx-4">
            <Image
              src={images[lightboxIndex]}
              alt={`${title} ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white hover:bg-white/10 rounded-full z-10"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 rounded-lg text-white text-sm">
            {lightboxIndex + 1} de {total}
          </div>
        </div>
      )}
    </>
  )
}
