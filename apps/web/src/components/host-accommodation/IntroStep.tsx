import Image from 'next/image'

export function IntroStep() {
  return (
    <section className="h-full max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-center px-4 sm:px-6 py-4">
      <div className="max-w-[520px]">
        <p className="text-sm font-medium text-[#222222] mb-2">Paso 1</p>
        <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] leading-tight font-semibold text-[#222222] mb-4">
          Describe tu espacio
        </h1>
        <p className="text-base lg:text-lg leading-snug text-[#222222]">
          En este paso, te preguntaremos qué tipo de propiedad tienes y si los huéspedes reservarán el
          alojamiento entero o solo una habitación. A continuación, indícanos la ubicación y cuántos huéspedes
          pueden quedarse.
        </p>
      </div>

      <div className="flex justify-center lg:justify-end">
        <Image
          src="https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80"
          alt="Ilustración de casa"
          width={520}
          height={360}
          className="w-full max-w-[480px] lg:max-w-[520px] rounded-xl object-cover shadow-sm"
          priority
        />
      </div>
    </section>
  )
}
