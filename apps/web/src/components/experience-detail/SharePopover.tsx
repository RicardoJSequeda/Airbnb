'use client'

import { useState, useRef, useEffect } from 'react'
import { Copy, Link as LinkIcon, MessageCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface SharePopoverProps {
  url: string
  title: string
  onClose: () => void
}

export default function SharePopover({ url, title, onClose }: SharePopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Enlace copiado al portapapeles')
      onClose()
    } catch {
      toast.error('Error al copiar enlace')
    }
  }

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`${title}\n${url}`)
    window.open(`https://wa.me/?text=${message}`, '_blank')
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={popoverRef}
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-50"
      >
        <button
          onClick={handleCopyLink}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors text-left"
        >
          <Copy className="w-4 h-4 text-neutral-600" strokeWidth={1.5} />
          <span className="text-sm text-neutral-900">Copiar enlace</span>
        </button>
        <button
          onClick={handleWhatsApp}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors text-left"
        >
          <MessageCircle className="w-4 h-4 text-neutral-600" strokeWidth={1.5} />
          <span className="text-sm text-neutral-900">Compartir en WhatsApp</span>
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
