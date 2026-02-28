'use client'

import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { motion } from 'framer-motion'

interface ExperienceLocationProps {
  title: string
  address: string
  city: string
  latitude: number
  longitude: number
}

export default function ExperienceLocation(props: ExperienceLocationProps) {
  const { city, address, latitude, longitude } = props
  const [isHovering, setIsHovering] = useState(false)
  
  // Mejorar lógica: solo mostrar address si es diferente y más específico que city
  const normalizedAddress = address?.trim() || ''
  const normalizedCity = city?.trim() || ''
  const hasSecondary = normalizedAddress !== '' && 
                       normalizedAddress.toLowerCase() !== normalizedCity.toLowerCase() &&
                       normalizedAddress.length > normalizedCity.length

  const handleClick = () => {
    // Buscar si hay una sección de mapa al final de la página
    const mapSection = document.getElementById('map-section')
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      // Si no hay mapa, abrir Google Maps
      const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`
      window.open(googleMapsUrl, '_blank')
    }
  }

  return (
    <div className="w-full">
      <motion.div
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
        className="flex items-center gap-3 cursor-pointer rounded-lg p-2 -m-2 transition-colors group"
      >
        <motion.div
          animate={isHovering ? { y: [0, -4, 0] } : {}}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-50 group-hover:bg-neutral-100 flex-shrink-0 p-2 transition-colors"
          aria-hidden
        >
          <MapPin className="w-5 h-5 text-neutral-600 group-hover:text-neutral-900 transition-colors" strokeWidth={1.5} fill="none" />
        </motion.div>
        <div className="min-w-0">
          <p className="font-semibold text-neutral-900 group-hover:text-neutral-950 transition-colors">{city}</p>
          {hasSecondary && (
            <p className="text-sm text-neutral-500 mt-0.5 group-hover:text-neutral-600 transition-colors">{normalizedAddress}</p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
