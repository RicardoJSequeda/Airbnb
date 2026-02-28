'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AskHostModal from './AskHostModal'

interface HostInfoModalProps {
  isOpen: boolean
  onClose: () => void
  hostId: string
  hostName: string
  hostAvatar?: string | null
  hostOccupation?: string
  hostBio?: string
  registrationNumber?: string
}

export default function HostInfoModal({
  isOpen,
  onClose,
  hostId,
  hostName,
  hostAvatar,
  hostOccupation,
  hostBio = 'Soy Juan, director ejecutivo de Gran Colombia Tours. Junto con mi equipo, organizo paseos guiados que reflejan el espíritu de Colombia: sus ciudades, tradiciones y gentes. Durante más de 9 años, hemos ayudado a los viajeros a adentrarse en la vida cotidiana, las historias y los ritmos que hacen que este país sea inolvidable. Únete a nosotros para ver el vibrante corazón de Colombia a través de los ojos de quienes mejor lo conocen.',
  registrationNumber,
}: HostInfoModalProps) {
  const [askHostModalOpen, setAskHostModalOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              onClick={onClose}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-[101] flex items-center justify-center p-4 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden my-8">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                  <h2 className="text-xl font-semibold text-neutral-900">Información sobre mí</h2>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5 text-neutral-600" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                  {/* Host Card */}
                  <div className="bg-white border border-neutral-200 rounded-xl p-6 mb-6 shadow-sm">
                    <div className="flex flex-col items-center text-center">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-4 -mt-12 border-4 border-white">
                        {hostAvatar ? (
                          <Image src={hostAvatar} alt={hostName} fill className="object-cover" sizes="96px" />
                        ) : (
                          <span className="flex items-center justify-center w-full h-full text-3xl font-semibold text-neutral-700">
                            {hostName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-semibold text-neutral-900 mb-1">{hostName}</h3>
                      {hostOccupation && (
                        <p className="text-sm text-neutral-500">{hostOccupation}</p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="mb-6">
                    <p className="text-neutral-700 leading-relaxed whitespace-pre-line">{hostBio}</p>
                  </div>

                  {/* Registration */}
                  {registrationNumber && (
                    <div className="mb-6">
                      <p className="text-sm text-neutral-600">
                        Estamos inscritos en el Registro Nacional de Turismo de Colombia con el número RNT {registrationNumber}.
                      </p>
                    </div>
                  )}

                  {/* Message Button */}
                  <motion.button
                    onClick={() => {
                      setAskHostModalOpen(true)
                      onClose()
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-semibold transition-colors"
                  >
                    Mensajea a {hostName}
                  </motion.button>

                  {/* Footer Disclaimer */}
                  <p className="text-xs text-neutral-500 mt-6 text-center">
                    Para proteger tus pagos, usa siempre Airbnb a la hora de transferir dinero y comunicarte con los anfitriones.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AskHostModal
        isOpen={askHostModalOpen}
        onClose={() => setAskHostModalOpen(false)}
        hostId={hostId}
        hostName={hostName}
      />
    </>
  )
}
