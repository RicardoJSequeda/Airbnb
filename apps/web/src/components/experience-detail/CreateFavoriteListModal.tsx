'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

interface CreateFavoriteListModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (listName: string) => void
}

export default function CreateFavoriteListModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateFavoriteListModalProps) {
  const [listName, setListName] = useState('Experiencias, 2026')
  const maxLength = 50

  useEffect(() => {
    if (isOpen) {
      setListName('Experiencias, 2026')
    }
  }, [isOpen])

  const handleCreate = () => {
    if (listName.trim().length < 3) {
      toast.error('El nombre debe tener al menos 3 caracteres')
      return
    }
    if (listName.trim().length > maxLength) {
      toast.error(`El nombre no puede tener más de ${maxLength} caracteres`)
      return
    }
    onSuccess?.(listName.trim())
    toast.success(`Lista "${listName.trim()}" creada`)
    onClose()
  }

  const handleClear = () => {
    setListName('')
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
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-200">
                <h2 className="text-xl font-semibold text-neutral-900">Crea una lista de favoritos</h2>
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
                <label htmlFor="list-name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Nombre
                </label>
                <div className="relative">
                  <input
                    id="list-name"
                    type="text"
                    value={listName}
                    onChange={(e) => setListName(e.target.value)}
                    maxLength={maxLength}
                    className="w-full px-4 py-3 pr-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Ej: Mis lugares favoritos"
                    autoFocus
                  />
                  {listName && (
                    <button
                      onClick={handleClear}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-neutral-100"
                      aria-label="Limpiar"
                    >
                      <X className="w-4 h-4 text-neutral-500" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  {listName.length}/{maxLength} caracteres
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-neutral-700 hover:text-neutral-900 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <motion.button
                  onClick={handleCreate}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={listName.trim().length < 3}
                  className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  Crear
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
