'use client'

type LoginModalDividerProps = {
  /** Texto en el centro (ej. "o continúa con") */
  label?: string
}

const DEFAULT_LABEL = 'o continúa con'

export function LoginModalDivider({ label = DEFAULT_LABEL }: LoginModalDividerProps) {
  return (
    <div className="flex items-center gap-3 my-4">
      <span className="flex-1 h-px bg-gray-200" />
      <span className="text-xs text-gray-500 shrink-0">{label}</span>
      <span className="flex-1 h-px bg-gray-200" />
    </div>
  )
}
