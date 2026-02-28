'use client'

import { useState } from 'react'
import { ModalOverlay } from '../LoginModal/ModalOverlay'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useLoginModalStore } from '@/lib/stores/login-modal-store'
import { getRedirectAfterAuth, type AuthRole } from '@/lib/auth-redirect'
import { parseErrorMessage } from '@/lib/utils/parse-error'

const TITLE_ID = 'register-modal-title'
const BUTTON_CLASS =
  'w-full py-3 rounded-lg text-white font-semibold text-sm transition-colors bg-gradient-to-r from-[#ff385c] to-[#e31c5f] hover:from-[#e31c5f] hover:to-[#c13584] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff385c] disabled:opacity-50'
const INPUT_CLASS =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-secondary placeholder:text-gray-400 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-sm'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 8

export type RegisterModalProps = {
  open: boolean
  onClose: () => void
  redirect?: string
}

export default function RegisterModal({
  open,
  onClose,
  redirect = '/',
}: RegisterModalProps) {
  const { setAuth } = useAuthStore()
  const openLoginModal = useLoginModalStore((s) => s.open)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)

  if (!open) return null

  const handleClose = () => {
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError(null)
    setFieldError(null)
    onClose()
  }

  const validate = (): boolean => {
    const nameTrim = name.trim()
    if (!nameTrim) {
      setFieldError('Ingresa tu nombre completo')
      return false
    }
    if (nameTrim.length < 2) {
      setFieldError('El nombre debe tener al menos 2 caracteres')
      return false
    }
    const emailTrim = email.trim()
    if (!emailTrim) {
      setFieldError('Ingresa tu correo electrónico')
      return false
    }
    if (!EMAIL_REGEX.test(emailTrim)) {
      setFieldError('Correo electrónico no válido')
      return false
    }
    if (password.length < MIN_PASSWORD) {
      setFieldError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres`)
      return false
    }
    if (password !== confirmPassword) {
      setFieldError('Las contraseñas no coinciden')
      return false
    }
    setFieldError(null)
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError(null)
    try {
      const { user, token } = await authApi.register({
        email: email.trim(),
        password,
        name: name.trim(),
      })
      setAuth(user, token)
      handleClose()
      const target = getRedirectAfterAuth((user.role as AuthRole) ?? 'GUEST', redirect)
      window.location.href = target
    } catch (err: unknown) {
      setError(parseErrorMessage(err, 'Error al crear la cuenta'))
    } finally {
      setLoading(false)
    }
  }

  const openLogin = () => {
    handleClose()
    openLoginModal(redirect)
  }

  return (
    <ModalOverlay onClose={handleClose} titleId={TITLE_ID}>
      <div className="px-6 pt-8 pb-6">
        <h2 id={TITLE_ID} className="text-lg font-semibold text-secondary text-center mb-1">
          Crear tu cuenta
        </h2>
        <p className="text-center text-sm text-tertiary mb-6">Regístrate para reservar o publicar</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="reg-name" className="block text-sm font-medium text-secondary mb-1.5">
              Nombre completo
            </label>
            <input
              id="reg-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setFieldError(null) }}
              autoComplete="name"
              className={INPUT_CLASS}
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-secondary mb-1.5">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldError(null) }}
              autoComplete="email"
              className={INPUT_CLASS}
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-secondary mb-1.5">
              Contraseña (mínimo 8 caracteres)
            </label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldError(null) }}
              autoComplete="new-password"
              className={INPUT_CLASS}
              placeholder="Contraseña"
              minLength={MIN_PASSWORD}
            />
          </div>
          <div>
            <label htmlFor="reg-confirm" className="block text-sm font-medium text-secondary mb-1.5">
              Confirmar contraseña
            </label>
            <input
              id="reg-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setFieldError(null) }}
              autoComplete="new-password"
              className={INPUT_CLASS}
              placeholder="Repite la contraseña"
            />
          </div>
          {(fieldError || error) && (
            <p className="text-sm text-red-600">{fieldError || error}</p>
          )}
          <button type="submit" disabled={loading} className={BUTTON_CLASS}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-sm text-secondary text-center mt-5">
          ¿Ya tienes cuenta?{' '}
          <button type="button" onClick={openLogin} className="text-[#0066cc] font-medium hover:underline">
            Inicia sesión
          </button>
        </p>
      </div>
    </ModalOverlay>
  )
}
