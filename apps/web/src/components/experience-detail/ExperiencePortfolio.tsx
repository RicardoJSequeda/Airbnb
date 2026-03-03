'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Maximize2 } from 'lucide-react'
import { motion } from 'framer-motion'
import ImageCarouselModal from './ImageCarouselModal'

interface ExperiencePortfolioProps {
  images: string[]
  title: string
}

export default function ExperiencePortfolio({ images, title }: ExperiencePortfolioProps) {
  const [carouselOpen, setCarouselOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const validImages = images.filter((url) => typeof url === 'string' && url.trim() !== '')
  const [img0, img1, img2] =
    validImages.length >= 3
      ? [validImages[0], validImages[1], validImages[2]]
      : [
          validImages[0] ?? '',
          validImages[1] ?? validImages[0] ?? '',
          validImages[2] ?? validImages[0] ?? '',
        ]

  const openGallery = (index: number) => {
    setSelectedIndex(Math.min(index, Math.max(0, validImages.length - 1)))
    setCarouselOpen(true)
  }

  if (validImages.length === 0) {
    return (
      <section className="w-full">
        <h2 className="text-[22px] font-semibold text-[#222222] mb-4">Mi porfolio</h2>
        <div className="aspect-[4/3] rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-500">
          Sin imágenes
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="w-full">
        <h2 className="text-[22px] font-semibold text-[#222222] mb-4">Mi porfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-2 rounded-2xl overflow-hidden">
          {/* Imagen grande izquierda (ocupa las 2 filas); la altura la marcan las dos de la derecha */}
          <motion.div
            className="relative min-h-[200px] md:min-h-0 md:row-span-2 cursor-pointer group overflow-hidden rounded-xl md:rounded-l-2xl md:rounded-r-none"
            onClick={() => openGallery(0)}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src={img0}
              alt={title}
              fill
              className="object-cover group-hover:opacity-95 transition-opacity duration-200"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </motion.div>
          {/* Imagen superior derecha */}
          <motion.div
            className="relative aspect-[4/3] min-h-[140px] cursor-pointer group overflow-hidden rounded-xl md:rounded-tr-2xl md:rounded-bl-none"
            onClick={() => openGallery(1)}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src={img1}
              alt={title}
              fill
              className="object-cover group-hover:opacity-95 transition-opacity duration-200"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          </motion.div>
          {/* Imagen inferior derecha con botón circular */}
          <motion.div
            className="relative aspect-[4/3] min-h-[140px] cursor-pointer group overflow-hidden rounded-xl md:rounded-br-2xl md:rounded-tl-none"
            onClick={() => openGallery(2)}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Image
              src={img2}
              alt={title}
              fill
              className="object-cover group-hover:opacity-95 transition-opacity duration-200"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            {/* Botón circular flotante (fondo oscuro semitransparente, icono claro) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                openGallery(2)
              }}
              className="absolute bottom-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition-all hover:bg-black/70 hover:scale-105 active:scale-95"
              aria-label="Ver todas las fotos"
            >
              <Maximize2 className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </motion.div>
        </div>
      </section>

      <ImageCarouselModal
        images={validImages}
        initialIndex={selectedIndex}
        isOpen={carouselOpen}
        onClose={() => setCarouselOpen(false)}
        title={title}
      />
    </>
  )
}
