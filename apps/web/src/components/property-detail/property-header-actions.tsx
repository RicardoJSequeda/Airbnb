'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, Share2, Heart } from 'lucide-react'
import { useState } from 'react'
import { favoritesApi } from '@/lib/api/favorites'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useLoginModalStore } from '@/lib/stores/login-modal-store'
import { toast } from 'sonner'

interface PropertyHeaderActionsProps {
  propertyId: string
  isFavorite: boolean
  onFavoriteChange?: (value: boolean) => void
  showBack?: boolean
}

export default function PropertyHeaderActions({
  propertyId,
  isFavorite,
  onFavoriteChange,
  showBack = true,
}: PropertyHeaderActionsProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const openLoginModal = useLoginModalStore((s) => s.open)
  const [saving, setSaving] = useState(false)

  const handleShare = async () => {
    if (typeof navigator?.share === 'function') {
      try {
        await navigator.share({
          title: 'Alojamiento en airbnb',
          url: window.location.href,
        })
        toast.success('Enlace copiado')
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          navigator.clipboard?.writeText(window.location.href)
          toast.success('Enlace copiado al portapapeles')
        }
      }
    } else {
      navigator.clipboard?.writeText(window.location.href)
      toast.success('Enlace copiado al portapapeles')
    }
  }

  const handleSave = async () => {
    if (!isAuthenticated) {
      openLoginModal(`/properties/${propertyId}`)
      return
    }
    setSaving(true)
    try {
      const res = await favoritesApi.toggle(propertyId)
      onFavoriteChange?.(res.isFavorite)
      toast.success(res.isFavorite ? 'Añadido a favoritos' : 'Quitado de favoritos')
    } catch {
      toast.error('Error al actualizar favoritos')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {showBack && (
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}
      <div className="flex items-center gap-2">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors text-sm font-medium"
        >
          <Share2 className="w-4 h-4" />
          Compartir
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors text-sm font-medium ${
            isFavorite ? 'text-[#FF5A5F]' : ''
          }`}
        >
          <Heart
            className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`}
            strokeWidth={1.5}
          />
          Guardar
        </button>
      </div>
    </div>
  )
}
