'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Home, Binoculars, Bell } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useLoginModalStore } from '@/lib/stores/login-modal-store'

export type ShareHostOption = 'alojamiento' | 'experiencia' | 'servicio'

/** Rutas en public/icons/. Cambia .avif por .png o .svg si usas ese formato. Si no cargan, se usan iconos Lucide. */
const ICON_IMAGES: Record<ShareHostOption, string> = {
  alojamiento: '/icons/alojamiento.avif',
  experiencia: '/icons/experiencia.avif',
  servicio: '/icons/servicio.avif',
}

const OPTIONS: { id: ShareHostOption; label: string; fallbackIcon: React.ReactNode }[] = [
  { id: 'alojamiento', label: 'Alojamiento', fallbackIcon: <Home className="w-14 h-14 text-secondary" /> },
  { id: 'experiencia', label: 'Experiencia', fallbackIcon: <Binoculars className="w-14 h-14 text-secondary" /> },
  { id: 'servicio', label: 'Servicio', fallbackIcon: <Bell className="w-14 h-14 text-secondary" /> },
]

interface ShareHostModalProps {
  open: boolean
  onClose: () => void
  basePath?: string
}

const ONBOARDING_PATH = '/host/onboarding'

export function ShareHostModal({ open, onClose, basePath = '/host' }: ShareHostModalProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const openLoginModal = useLoginModalStore((s) => s.open)
  const [selected, setSelected] = useState<ShareHostOption | null>(null)

  if (!open) return null

  const handleNext = () => {
    if (!selected) return
    onClose()
    setSelected(null)
    const targetUrl = `${ONBOARDING_PATH}?type=${selected}`
    if (isAuthenticated) {
      router.push(targetUrl)
    } else {
      openLoginModal(targetUrl)
    }
  }

  const handleClose = () => {
    setSelected(null)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-host-modal-title"
      onClick={handleClose}
    >
      {/* Modal: caja blanca grande, esquinas muy redondeadas, sombra suave elevada */}
      <div
        className="relative w-full max-w-[520px] mx-4 rounded-3xl bg-white shadow-[0_24px_48px_rgba(0,0,0,0.12)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Contenido interno con padding generoso */}
        <div className="p-6 pt-5 pb-6">
          {/* X solo arriba a la izquierda */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute left-5 top-5 p-1.5 rounded-full hover:bg-gray-100 text-gray-700 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Título en su propia fila, centrado (debajo del X) */}
          <h2
            id="share-host-modal-title"
            className="text-[22px] font-medium text-secondary text-center mt-10 mb-8"
          >
            ¿Qué te gustaría compartir?
          </h2>

          {/* Tres tarjetas separadas, con espacio claro entre ellas */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelected(opt.id)}
                className={`flex flex-col items-center justify-center gap-4 py-6 px-4 rounded-2xl border-2 transition-all ${
                  selected === opt.id
                    ? 'border-secondary bg-gray-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                {/* Icono centrado: imagen si existe, si no fallback lucide (estático) */}
                <span className="flex items-center justify-center w-[72px] h-[72px] shrink-0">
                  <ShareHostOptionIcon optionId={opt.id} fallback={opt.fallbackIcon} />
                </span>
                <span className="text-[15px] font-medium text-secondary leading-tight text-center">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>

          {/* Siguiente: abajo a la derecha; gris claro cuando deshabilitado */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              disabled={!selected}
              className={`min-w-[100px] px-6 py-2.5 rounded-lg font-medium transition-colors ${
                selected
                  ? 'bg-secondary text-white hover:bg-gray-800'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Muestra la imagen del icono si existe en public/icons; si no, el fallback (lucide). */
function ShareHostOptionIcon({ optionId, fallback }: { optionId: ShareHostOption; fallback: React.ReactNode }) {
  const [imgFailed, setImgFailed] = useState(false)
  const src = ICON_IMAGES[optionId]

  if (imgFailed) {
    return <span className="flex items-center justify-center w-[72px] h-[72px]">{fallback}</span>
  }

  return (
    <span className="relative w-[72px] h-[72px] flex items-center justify-center">
      <img
        src={src}
        alt=""
        width={72}
        height={72}
        className="object-contain w-[72px] h-[72px]"
        onError={() => setImgFailed(true)}
      />
    </span>
  )
}
