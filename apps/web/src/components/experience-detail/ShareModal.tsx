'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Copy, Mail, MessageCircle, Facebook, Twitter, MoreHorizontal, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  rating: number
  imageUrl?: string
  url: string
}

export default function ShareModal({ isOpen, onClose, title, rating, imageUrl, url }: ShareModalProps) {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Enlace copiado al portapapeles')
      onClose()
    } catch {
      toast.error('Error al copiar enlace')
    }
  }

  const handleEmail = () => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(`${title}\n${url}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`${title}\n${url}`)
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const handleFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  }

  const handleTwitter = () => {
    const text = encodeURIComponent(title)
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`, '_blank')
  }

  const handleMessenger = () => {
    window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=YOUR_APP_ID`, '_blank')
  }

  const shareOptions = [
    { icon: Copy, label: 'Copia el enlace', onClick: handleCopyLink },
    { icon: Mail, label: 'Correo electrónico', onClick: handleEmail },
    { icon: MessageCircle, label: 'Mensajes', onClick: () => toast.info('Función próximamente disponible') },
    { icon: MessageCircle, label: 'WhatsApp', onClick: handleWhatsApp, className: 'text-green-600' },
    { icon: MessageCircle, label: 'Messenger', onClick: handleMessenger },
    { icon: Facebook, label: 'Facebook', onClick: handleFacebook, className: 'text-blue-600' },
    { icon: Twitter, label: 'Twitter', onClick: handleTwitter, className: 'text-black' },
    { icon: MoreHorizontal, label: 'Más opciones', onClick: () => toast.info('Más opciones próximamente') },
  ]

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
                <h2 className="text-xl font-semibold text-neutral-900">Comparte esta experiencia</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-neutral-100 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5 text-neutral-600" strokeWidth={1.5} />
                </button>
              </div>

              {/* Experience Summary */}
              <div className="p-6 border-b border-neutral-200">
                <div className="flex gap-4">
                  {imageUrl && (
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-100">
                      <Image src={imageUrl} alt={title} fill className="object-cover" sizes="64px" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 line-clamp-2">{title}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 fill-neutral-900 text-neutral-900" />
                      <span className="text-sm text-neutral-700">{rating.toFixed(1).replace('.', ',')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Options Grid */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3">
                  {shareOptions.map((option, index) => {
                    const Icon = option.icon
                    return (
                      <motion.button
                        key={index}
                        onClick={option.onClick}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 p-4 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors text-left"
                      >
                        <Icon className={`w-5 h-5 text-neutral-600 ${option.className || ''}`} strokeWidth={1.5} />
                        <span className="text-sm font-medium text-neutral-900">{option.label}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
