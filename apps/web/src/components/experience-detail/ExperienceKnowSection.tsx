'use client'

import { Users, Activity, Accessibility, CalendarX } from 'lucide-react'

interface KnowItem {
  icon: React.ReactNode
  title: string
  description: string
  link?: { label: string; href?: string }
}

interface ExperienceKnowSectionProps {
  guestRequirements?: string
  activityLevel?: string
  accessibility?: string
  cancellationPolicy?: string
}

export default function ExperienceKnowSection({
  guestRequirements = 'Pueden asistir viajeros de 2 años o más, hasta 9 viajeros en total.',
  activityLevel = 'El nivel de actividad de esta Experiencia es moderado.',
  accessibility = 'Mensajea a tu anfitrión para obtener más información.',
  cancellationPolicy = 'Si cancelas la reservación al menos 1 día antes del horario de inicio, recibirás un reembolso total.',
}: ExperienceKnowSectionProps) {
  const items: KnowItem[] = [
    { icon: <Users className="w-5 h-5 text-neutral-700" strokeWidth={1.5} />, title: 'Requisitos para los huéspedes', description: guestRequirements },
    { icon: <Activity className="w-5 h-5 text-neutral-700" strokeWidth={1.5} />, title: 'Nivel de actividad', description: activityLevel },
    {
      icon: <Accessibility className="w-5 h-5 text-neutral-700" strokeWidth={1.5} />,
      title: 'Accesibilidad',
      description: accessibility,
      link: { label: 'Más información' },
    },
    {
      icon: <CalendarX className="w-5 h-5 text-neutral-700" strokeWidth={1.5} />,
      title: 'Política de cancelación',
      description: cancellationPolicy,
    },
  ]

  return (
    <section className="border-t border-neutral-200 pt-8 space-y-4">
      <h2 className="text-xl font-semibold text-neutral-900">Aspectos destacados del anuncio</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {items.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">{item.icon}</div>
            <h3 className="font-semibold text-neutral-900">{item.title}</h3>
            <p className="text-sm text-neutral-600">{item.description}</p>
            {item.link && (
              <a href={item.link.href ?? '#'} className="text-sm text-rose-500 underline hover:text-rose-600 transition-colors duration-150 ease-out">
                {item.link.label}
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
