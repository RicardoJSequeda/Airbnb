'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Grid } from 'lucide-react'
import { motion } from 'framer-motion'
import ImageCarouselModal from './ImageCarouselModal'

interface ExperienceGalleryProps {
  images: string[]
  title: string
}

export default function ExperienceGallery({ images, title }: ExperienceGalleryProps) {
  const [carouselOpen, setCarouselOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [img0, img1, img2, img3] = images.length >= 4
    ? [images[0], images[1], images[2], images[3]]
    : [
        images[0] ?? '',
        images[1] ?? images[0] ?? '',
        images[2] ?? images[0] ?? '',
        images[3] ?? images[1] ?? images[0] ?? '',
      ]

  const handleImageClick = (index: number) => {
    // Asegurar índice válido (por si hay menos de 4 imágenes)
    setSelectedIndex(Math.min(index, Math.max(0, images.length - 1)))
    setCarouselOpen(true)
  }

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] rounded-2xl bg-gray-200 flex items-center justify-center text-gray-500">
        Sin imagenes
      </div>
    )
  }

  return (
    <>
      <div className="relative grid grid-cols-2 grid-rows-2 gap-2 rounded-2xl overflow-hidden aspect-[4/3]">
        {/* Imagen grande arriba izquierda */}
        <motion.div
          className="relative col-span-1 row-span-2 min-h-0 cursor-pointer group overflow-hidden"
          onClick={() => handleImageClick(0)}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src={img0}
            alt={title}
            fill
            className="object-cover group-hover:opacity-90 transition-opacity duration-200 ease-out"
            sizes="50vw"
            priority
          />
        </motion.div>
        {/* Imagen pequeña arriba derecha */}
        <motion.div
          className="relative col-span-1 row-span-1 min-h-0 cursor-pointer group overflow-hidden"
          onClick={() => handleImageClick(1)}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src={img1}
            alt={title}
            fill
            className="object-cover group-hover:opacity-90 transition-opacity duration-200 ease-out"
            sizes="25vw"
          />
        </motion.div>
        {/* Imagen pequeña abajo izquierda */}
        <motion.div
          className="relative col-span-1 row-span-1 min-h-0 cursor-pointer group overflow-hidden"
          onClick={() => handleImageClick(2)}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src={img2}
            alt={title}
            fill
            className="object-cover group-hover:opacity-90 transition-opacity duration-200 ease-out"
            sizes="25vw"
          />
        </motion.div>
        {/* Imagen pequeña abajo derecha */}
        <motion.div
          className="relative col-span-1 row-span-1 min-h-0 cursor-pointer group overflow-hidden"
          onClick={() => handleImageClick(3)}
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Image
            src={img3}
            alt={title}
            fill
            className="object-cover group-hover:opacity-90 transition-opacity duration-200 ease-out"
            sizes="25vw"
          />
        </motion.div>

        {/* Botón "Ver todas las fotos" - Mostrar siempre si hay más de 4 imágenes */}
        {images.length > 4 && (
          <motion.button
            type="button"
            onClick={() => handleImageClick(0)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="absolute bottom-4 right-4 bg-white text-neutral-900 text-sm font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-out flex items-center gap-2 z-10 cursor-pointer"
          >
            <Grid className="w-4 h-4" strokeWidth={1.5} />
            Ver todas las fotos
          </motion.button>
        )}
      </div>

      <ImageCarouselModal
        images={images}
        initialIndex={selectedIndex}
        isOpen={carouselOpen}
        onClose={() => setCarouselOpen(false)}
        title={title}
      />
    </>
  )
}
