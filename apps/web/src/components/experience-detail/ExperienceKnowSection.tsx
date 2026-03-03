'use client'

import { Users, Accessibility, CalendarX } from 'lucide-react'

interface KnowItem {
  icon: React.ReactNode
  title: string
  description: string
  link?: { label: string; href?: string }
}

interface ExperienceKnowSectionProps {
  guestRequirements?: string
  accessibility?: string
  cancellationPolicy?: string
}

export default function ExperienceKnowSection({
  guestRequirements = 'Pueden asistir participantes de 18 años o más.',
  accessibility = 'Mensajea a tu anfitrión para obtener más información.',
  cancellationPolicy = 'Si cancelas la reservación al menos 1 día antes del horario de inicio, recibirás un reembolso total.',
}: ExperienceKnowSectionProps) {
  const items: KnowItem[] = [
    {
      icon: <Users className="w-5 h-5 text-[#222222]" strokeWidth={1.5} />,
      title: 'Requisitos para los huéspedes',
      description: guestRequirements,
    },
    {
      icon: <Accessibility className="w-5 h-5 text-[#222222]" strokeWidth={1.5} />,
      title: 'Accesibilidad',
      description: accessibility,
      link: { label: 'Más información', href: '#accesibilidad' },
    },
    {
      icon: <CalendarX className="w-5 h-5 text-[#222222]" strokeWidth={1.5} />,
      title: 'Política de cancelación',
      description: cancellationPolicy,
    },
  ]

  return (
    <section className="w-full border-t border-[#EBEBEB] pt-8">
      <h2 className="text-[22px] sm:text-[24px] font-semibold text-[#222222] mb-6">
        Lo que debes saber
      </h2>
      {/* 2 columnas como en la captura; el tercer item cae abajo a la izquierda */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-16 gap-y-8">
        {items.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center mb-1">{item.icon}</div>
            <h3 className="font-semibold text-[#222222] text-[15px]">
              {item.title}
            </h3>
            <p className="text-[14px] text-neutral-600 leading-relaxed">
              {item.description}
              {item.link && (
                <>
                  {' '}
                  <a
                    href={item.link.href ?? '#'}
                    className="text-neutral-600 underline hover:no-underline"
                  >
                    {item.link.label}
                  </a>
                </>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
