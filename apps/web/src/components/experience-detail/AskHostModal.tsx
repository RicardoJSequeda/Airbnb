'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface AskHostModalProps {
  isOpen: boolean
  onClose: () => void
  hostId: string
  hostName: string
}

export default function AskHostModal({ isOpen, onClose, hostId, hostName }: AskHostModalProps) {
  const [message, setMessage] = useState('')
  const minLength = 20

  const handleSend = () => {
    if (message.trim().length < minLength) {
      toast.error(`El mensaje debe tener al menos ${minLength} caracteres`)
      return
    }
    // Aquí iría la lógica para enviar el mensaje
    toast.success(`Mensaje enviado a ${hostName}`)
    setMessage('')
    onClose()
  }

  return (
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
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-900">Pregúntale a {hostName}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5 text-neutral-600" strokeWidth={1.5} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-sm text-neutral-600 mb-4">
                  Envía un mensaje para obtener más información acerca de esta Experiencia.
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="No olvides presentarte."
                  className="w-full h-32 px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                  autoFocus
                />
                <p className="text-xs text-neutral-500 mt-2">
                  {message.length} de {minLength} caracteres obligatorios
                </p>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-neutral-200">
                <motion.button
                  onClick={handleSend}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={message.trim().length < minLength}
                  className="w-full py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed text-neutral-900 font-semibold transition-colors"
                >
                  Envía un mensaje
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
