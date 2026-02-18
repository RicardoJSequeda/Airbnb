'use client'

interface ExperienceDescriptionProps {
  description: string
  languages?: string[]
}

/** Descripción principal + “Se tradujo automáticamente” (referencia). */
export default function ExperienceDescription({
  description,
  languages = [],
}: ExperienceDescriptionProps) {
  const languageLabel =
    languages.length > 0
      ? `Esta experiencia se ofrece en ${languages.join(' y ').toLowerCase()}.`
      : 'Esta experiencia se ofrece en inglés y español.'

  return (
    <div className="space-y-3">
      <p className="text-secondary leading-relaxed whitespace-pre-line">
        {description}
      </p>
      <p className="text-sm text-text-2">{languageLabel}</p>
      <p className="text-sm text-text-2 flex items-center gap-1">
        <span>Se tradujo automáticamente</span>
      </p>
    </div>
  )
}
