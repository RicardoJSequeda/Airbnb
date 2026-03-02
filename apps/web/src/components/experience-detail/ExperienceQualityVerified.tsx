'use client'

/** Mapeo categoría técnica → texto para "Verificamos la calidad de [X] en Airbnb" */
const CATEGORY_LABEL: Record<string, string> = {
  workshop: 'Fotografías',
  tasting: 'Experiencias gastronómicas',
  adventure: 'Experiencias de aventura',
}

const DEFAULT_LABEL = 'Experiencias'

interface ExperienceQualityVerifiedProps {
  category?: string
}

export default function ExperienceQualityVerified({ category }: ExperienceQualityVerifiedProps) {
  const label = (category && CATEGORY_LABEL[category]) || DEFAULT_LABEL

  return (
    <section className="w-full border-t border-neutral-200 pt-8">
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="flex-shrink-0 w-14 h-14 rounded-full border-2 border-amber-400/80 bg-amber-50/80 flex items-center justify-center">
          <span className="text-2xl text-amber-600/90" aria-hidden>◇</span>
        </div>
        <div>
          <h2 className="text-[22px] font-semibold text-[#222222] mb-2">
            Verificamos la calidad de {label} en Airbnb
          </h2>
          <p className="text-[16px] text-neutral-700 leading-relaxed">
            Evaluamos a cada profesional en función de su experiencia, su portfolio de trabajos destacados y su reputación.{' '}
            <button type="button" className="text-[#222222] underline hover:no-underline">
              Más información
            </button>
          </p>
        </div>
      </div>
    </section>
  )
}
