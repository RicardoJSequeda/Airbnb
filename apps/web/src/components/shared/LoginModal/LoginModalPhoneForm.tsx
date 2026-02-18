'use client'

import Link from 'next/link'
import { LOGIN_MODAL_COUNTRIES } from './constants'
export type CountryOption = { value: string; label: string }

type LoginModalPhoneFormProps = {
  onContinue: () => void
  /** URL para el enlace de política de privacidad */
  privacyLink?: string
  /** Texto del botón principal */
  continueLabel?: string
  /** Lista de países (por defecto LOGIN_MODAL_COUNTRIES). Útil para i18n o tenant. */
  countries?: readonly CountryOption[]
}

const DEFAULT_PRIVACY_LINK = '/privacy'
const DEFAULT_CONTINUE_LABEL = 'Continúa'

/** Botón principal con degradado rosa a rojo (referencia Airbnb) */
const CONTINUE_BUTTON_CLASS =
  'w-full py-3 rounded-lg text-white font-semibold text-sm transition-colors bg-gradient-to-r from-[#ff385c] to-[#e31c5f] hover:from-[#e31c5f] hover:to-[#c13584] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff385c]'

export function LoginModalPhoneForm({
  onContinue,
  privacyLink = DEFAULT_PRIVACY_LINK,
  continueLabel = DEFAULT_CONTINUE_LABEL,
  countries = LOGIN_MODAL_COUNTRIES,
}: LoginModalPhoneFormProps) {
  const countryList = countries as readonly { value: string; label: string }[]
  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="login-country"
          className="block text-sm font-medium text-secondary mb-1.5"
        >
          País o región
        </label>
        <select
          id="login-country"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-secondary focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-sm"
        >
          {countryList.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="login-phone"
          className="block text-sm font-medium text-secondary mb-1.5"
        >
          Número de teléfono
        </label>
        <input
          id="login-phone"
          type="tel"
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-secondary placeholder:text-gray-400 focus:ring-2 focus:ring-secondary focus:border-transparent outline-none text-sm"
          placeholder="Número de teléfono"
        />
        <p className="mt-2 text-xs text-gray-500">
          Te vamos a confirmar el número por teléfono o mensaje de texto. Sujeto a
          las tarifas estándar para mensajes y datos.{' '}
          <Link
            href={privacyLink}
            className="text-[#0066cc] underline hover:no-underline"
          >
            Política de privacidad
          </Link>
          .
        </p>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className={CONTINUE_BUTTON_CLASS}
      >
        {continueLabel}
      </button>
    </div>
  )
}
