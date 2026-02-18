'use client'

import {
  LOGIN_MODAL_SOCIAL_PROVIDERS,
  type LoginModalSocialId,
} from './constants'
import { SocialIcon } from './SocialLoginIcons'

type SocialLoginButtonsProps = {
  /** Si se define, solo se muestran estos proveedores (útil para escalar/ocultar) */
  providerIds?: readonly LoginModalSocialId[]
  /** Clase del contenedor */
  className?: string
  /** Callback por proveedor (opcional) */
  onProviderClick?: (id: LoginModalSocialId) => void
}

const BUTTON_CLASS =
  'w-full flex items-center justify-center gap-2.5 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-secondary hover:bg-gray-50 transition-colors'

export function SocialLoginButtons({
  providerIds,
  className = 'grid grid-cols-1 gap-2.5',
  onProviderClick,
}: SocialLoginButtonsProps) {
  const list = providerIds
    ? LOGIN_MODAL_SOCIAL_PROVIDERS.filter((p) => providerIds.includes(p.id))
    : [...LOGIN_MODAL_SOCIAL_PROVIDERS]

  return (
    <div className={className}>
      {list.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          className={BUTTON_CLASS}
          onClick={() => onProviderClick?.(id)}
        >
          <SocialIcon id={id} className="shrink-0 text-secondary" />
          {label}
        </button>
      ))}
    </div>
  )
}
