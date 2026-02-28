'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import HostInfoModal from './HostInfoModal'

interface ExperienceHostCardProps {
  hostId: string
  hostName: string
  hostAvatar?: string | null
  /** Ocupación o título del anfitrión (ej. "Guías culturales en Gran Colombia Tours") */
  hostOccupation?: string
  hostBio?: string
  registrationNumber?: string
}

export default function ExperienceHostCard(props: ExperienceHostCardProps) {
  const { hostId, hostName, hostAvatar, hostOccupation, hostBio, registrationNumber } = props
  const [hostModalOpen, setHostModalOpen] = useState(false)

  const handleClick = () => {
    setHostModalOpen(true)
  }

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setHostModalOpen(true)
  }

  return (
    <motion.div
      className="w-full"
      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
      transition={{ duration: 0.15 }}
    >
      <div
        onClick={handleClick}
        className="flex items-center gap-4 cursor-pointer rounded-lg p-2 -m-2 transition-colors group"
      >
        <motion.div
          onClick={handleAvatarClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 cursor-pointer"
        >
          {hostAvatar ? (
            <Image src={hostAvatar} alt={hostName} fill className="object-cover" sizes="48px" />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-lg font-semibold text-neutral-700">
              {hostName.charAt(0).toUpperCase()}
            </span>
          )}
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-neutral-900 group-hover:text-neutral-950 transition-colors">
            Anfitrión: {hostName}
          </p>
          {hostOccupation && (
            <p className="mt-0.5 text-sm text-neutral-500 group-hover:text-neutral-600 transition-colors">{hostOccupation}</p>
          )}
        </div>
      </div>

      <HostInfoModal
        isOpen={hostModalOpen}
        onClose={() => setHostModalOpen(false)}
        hostId={hostId}
        hostName={hostName}
        hostAvatar={hostAvatar}
        hostOccupation={hostOccupation}
        hostBio={hostBio}
        registrationNumber={registrationNumber}
      />
    </motion.div>
  )
}
