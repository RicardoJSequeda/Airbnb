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
    { icon: <Users className="w-6 h-6 text-secondary" />, title: 'Requisitos para los huéspedes', description: guestRequirements },
    { icon: <Activity className="w-6 h-6 text-secondary" />, title: 'Nivel de actividad', description: activityLevel },
    {
      icon: <Accessibility className="w-6 h-6 text-secondary" />,
      title: 'Accesibilidad',
      description: accessibility,
      link: { label: 'Más información' },
    },
    {
      icon: <CalendarX className="w-6 h-6 text-secondary" />,
      title: 'Política de cancelación',
      description: cancellationPolicy,
    },
  ]

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold text-secondary">Lo que debes saber</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {items.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center gap-2">{item.icon}</div>
            <h3 className="font-semibold text-secondary">{item.title}</h3>
            <p className="text-sm text-text-2">{item.description}</p>
            {item.link && (
              <a href={item.link.href ?? '#'} className="text-sm text-primary underline">
                {item.link.label}
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
