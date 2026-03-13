'use client'

import Image from 'next/image'

export function FinishIntroStep() {
  return (
    <section className="h-full max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-center px-4 sm:px-6 py-6">
      <div className="max-w-[520px]">
        <p className="text-sm font-semibold text-[#222222] mb-3">Paso 3</p>
        <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight font-semibold text-[#222222] mb-4">
          Terminar y publicar
        </h1>
        <p className="text-base lg:text-lg leading-relaxed text-[#222222]">
          Por último, vas a elegir la configuración de las reservaciones, establecer el precio y
          publicar tu anuncio.
        </p>
      </div>

      <div className="flex justify-center lg:justify-end">
        <Image
          src="/icons/paso 2.png"
          alt="Casa lista para publicar"
          width={520}
          height={360}
          className="w-full max-w-[480px] lg:max-w-[520px] rounded-xl object-contain"
          priority
        />
      </div>
    </section>
  )
}

