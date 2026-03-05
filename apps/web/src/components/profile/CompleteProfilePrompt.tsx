'use client'

import Link from 'next/link'

export interface CompleteProfilePromptProps {
  title?: string
  description?: string
  ctaLabel?: string
  ctaHref?: string
  onCtaClick?: () => void
  className?: string
}

const defaultTitle = 'Completa tu perfil'
const defaultDescription =
  'Tu perfil en Airbnb es una parte importante de todas las reservaciones. Completa el tuyo para que los demás anfitriones y huéspedes te conozcan mejor.'
const defaultCtaLabel = 'Comencemos'

export function CompleteProfilePrompt({
  title = defaultTitle,
  description = defaultDescription,
  ctaLabel = defaultCtaLabel,
  ctaHref = '/users/profile/edit',
  onCtaClick,
  className = '',
}: CompleteProfilePromptProps) {
  return (
    <div
      className={`flex-1 min-w-0 flex flex-col ${className}`}
    >
      <h3 className="text-xl font-semibold text-neutral-900 mb-3">{title}</h3>
      <p className="text-sm text-neutral-600 leading-relaxed mb-5">{description}</p>
      {onCtaClick ? (
        <button
          type="button"
          onClick={onCtaClick}
          className="self-start bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors duration-150"
        >
          {ctaLabel}
        </button>
      ) : (
        <Link
          href={ctaHref}
          prefetch
          className="self-start bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors duration-150 inline-block"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
