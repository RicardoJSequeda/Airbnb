'use client'

type LoginModalHeaderProps = {
  title?: string
  subtitle?: string
  titleId?: string
}

const DEFAULT_TITLE = 'Iniciar sesión o registrarse'
const DEFAULT_SUBTITLE = 'Te damos la bienvenida a Airbnb'

export function LoginModalHeader({
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  titleId = 'login-modal-title',
}: LoginModalHeaderProps) {
  return (
    <div className="text-center mb-5">
      <h2
        id={titleId}
        className="text-lg font-semibold text-secondary leading-tight"
      >
        {title}
      </h2>
      <p className="text-lg font-semibold text-secondary mt-1">
        {subtitle}
      </p>
    </div>
  )
}
