'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShieldCheck } from 'lucide-react'
import AskHostModal from './AskHostModal'

const DEFAULT_BIO =
  'Soy Juan, director ejecutivo de Gran Colombia Tours. Junto con mi equipo, organizo paseos guiados que reflejan el espíritu de Colombia: sus ciudades, tradiciones y gentes. Durante más de 9 años, hemos ayudado a los viajeros a adentrarse en la vida cotidiana, las historias y los ritmos que hacen que este país sea inolvidable. Únete a nosotros para ver el vibrante corazón de Colombia a través de los ojos de quienes mejor lo conocen.'

interface ExperienceHostAboutSectionProps {
  hostId: string
  hostName: string
  hostAvatar?: string | null
  hostOccupation?: string
  hostBio?: string
  registrationNumber?: string
}

export default function ExperienceHostAboutSection({
  hostId,
  hostName,
  hostAvatar,
  hostOccupation,
  hostBio = DEFAULT_BIO,
  registrationNumber,
}: ExperienceHostAboutSectionProps) {
  const [askHostModalOpen, setAskHostModalOpen] = useState(false)

  return (
    <section className="w-full bg-white">
      <h2 className="text-[22px] font-semibold text-[#222222] mb-4">
        Información sobre mí
      </h2>
      {/* Layout de dos columnas: card del host (izquierda) y contenido (derecha) */}
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-12">
        {/* Columna izquierda: tarjeta del host + botón + aviso seguridad */}
        <div className="w-full lg:w-[320px] flex-shrink-0">
          {/* Card blanca independiente */}
          <div className="rounded-[24px] border border-[#EBEBEB] bg-white shadow-[0_6px_20px_rgba(0,0,0,0.06)] px-8 py-8 flex flex-col items-center text-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-neutral-200">
              {hostAvatar ? (
                <Image
                  src={hostAvatar}
                  alt={hostName}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <span className="flex items-center justify-center w-full h-full text-2xl font-semibold text-neutral-600">
                  {hostName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col items-center text-center w-full">
              <h3 className="mt-4 text-3xl font-bold text-[#222222]">{hostName}</h3>
              {hostOccupation && (
                <p className="mt-1 text-base font-normal text-[#717171]">
                  {hostOccupation}
                </p>
              )}
            </div>
          </div>
          {/* Botón fuera de la card, mismo ancho */}
          <button
            type="button"
            onClick={() => setAskHostModalOpen(true)}
            className="mt-8 w-full py-3 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[#222222] font-semibold transition-colors"
          >
            Mensajea a {hostName}
          </button>
          {/* Aviso de seguridad con icono de escudo */}
          <div className="mt-3 flex items-start gap-2 text-sm text-neutral-500">
            <ShieldCheck className="w-4 h-4 mt-0.5 text-neutral-500" />
            <p>
              Para proteger tus pagos, usa siempre Airbnb a la hora de transferir dinero y comunicarte con los anfitriones.
            </p>
          </div>
        </div>

        {/* Columna derecha: biografía + información legal (RNT) */}
        <div className="flex-1 min-w-0 -ml-3 lg:-ml-4">
          <p className="mt-2 text-xs text-[#222222] leading-relaxed">
            {hostBio}
          </p>
          {registrationNumber && (
            <p className="mt-4 text-xs text-[#222222] leading-relaxed">
              Estamos inscritos en el Registro Nacional de Turismo de Colombia con el número RNT {registrationNumber}.
            </p>
          )}
        </div>
      </div>

      <AskHostModal
        isOpen={askHostModalOpen}
        onClose={() => setAskHostModalOpen(false)}
        hostId={hostId}
        hostName={hostName}
      />
    </section>
  )
}
