'use client'

import { useRouter } from 'next/navigation'
import { ModalOverlay } from './ModalOverlay'
import { LoginModalHeader } from './LoginModalHeader'
import { LoginModalPhoneForm } from './LoginModalPhoneForm'
import { LoginModalDivider } from './LoginModalDivider'
import { SocialLoginButtons } from './SocialLoginButtons'
import type { LoginModalSocialId } from './constants'

/** Props opcionales para personalizar textos y comportamiento sin tocar el código interno */
export type LoginModalContentProps = {
  title?: string
  subtitle?: string
  dividerLabel?: string
  privacyLink?: string
  continueLabel?: string
  /** Solo mostrar estos proveedores (ej. ['google', 'apple']). Si no se pasa, se muestran todos. */
  providerIds?: readonly LoginModalSocialId[]
  /** Callback al pulsar un proveedor social (ej. para analytics o login OAuth) */
  onSocialProviderClick?: (id: LoginModalSocialId) => void
}

export type LoginModalProps = {
  open: boolean
  onClose: () => void
  /** Si se indica, al pulsar Continúa se redirige a /login?redirect=... */
  redirect?: string
} & LoginModalContentProps

const TITLE_ID = 'login-modal-title'

export default function LoginModal({
  open,
  onClose,
  redirect,
  title,
  subtitle,
  dividerLabel,
  privacyLink,
  continueLabel,
  providerIds,
  onSocialProviderClick,
}: LoginModalProps) {
  const router = useRouter()

  if (!open) return null

  const handleContinue = () => {
    onClose()
    const url = redirect
      ? `/login?redirect=${encodeURIComponent(redirect)}`
      : '/login'
    router.push(url)
  }

  return (
    <ModalOverlay onClose={onClose} titleId={TITLE_ID}>
      <div className="px-6 pt-8 pb-6">
        <LoginModalHeader titleId={TITLE_ID} title={title} subtitle={subtitle} />
        <LoginModalPhoneForm
          onContinue={handleContinue}
          privacyLink={privacyLink}
          continueLabel={continueLabel}
        />
        <LoginModalDivider label={dividerLabel} />
        <SocialLoginButtons
          providerIds={providerIds}
          onProviderClick={onSocialProviderClick}
        />
      </div>
    </ModalOverlay>
  )
}

// Re-exportar piezas por si se quieren usar por separado o escalar
export { ModalOverlay, LoginModalHeader, LoginModalPhoneForm, LoginModalDivider, SocialLoginButtons }
export { LOGIN_MODAL_COUNTRIES, LOGIN_MODAL_SOCIAL_PROVIDERS } from './constants'
export type { LoginModalCountryCode, LoginModalSocialId } from './constants'
