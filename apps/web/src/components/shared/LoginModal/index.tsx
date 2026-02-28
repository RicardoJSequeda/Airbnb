'use client'

import { useState } from 'react'
import { ModalOverlay } from './ModalOverlay'
import { LoginModalHeader } from './LoginModalHeader'
import { LoginModalLoginForm } from './LoginModalLoginForm'
import { useRegisterModalStore } from '@/lib/stores/register-modal-store'

export type LoginModalContentProps = {
  title?: string
  subtitle?: string
}

export type LoginModalProps = {
  open: boolean
  onClose: () => void
  /** Tras login exitoso se redirige aquí. Por defecto "/". */
  redirect?: string
} & LoginModalContentProps

const TITLE_ID = 'login-modal-title'

export default function LoginModal({
  open,
  onClose,
  redirect = '/',
  title,
  subtitle,
}: LoginModalProps) {
  const openRegisterModal = useRegisterModalStore((s) => s.open)

  if (!open) return null

  const handleClose = () => {
    onClose()
  }

  const handleOpenRegister = () => {
    onClose()
    openRegisterModal(redirect)
  }

  return (
    <ModalOverlay onClose={handleClose} titleId={TITLE_ID}>
      <div className="px-6 pt-8 pb-6">
        <LoginModalHeader titleId={TITLE_ID} title={title ?? 'Iniciar sesión'} subtitle={subtitle ?? ''} />
        <LoginModalLoginForm
          redirect={redirect}
          onSuccess={handleClose}
          onOpenRegister={handleOpenRegister}
        />
      </div>
    </ModalOverlay>
  )
}

export { ModalOverlay, LoginModalHeader }
export { LOGIN_MODAL_COUNTRIES, LOGIN_MODAL_SOCIAL_PROVIDERS } from './constants'
export type { LoginModalCountryCode, LoginModalSocialId } from './constants'
