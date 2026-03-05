import Image from 'next/image'

export function IntroStep() {
  return (
    <section className="h-full max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center px-8">
      <div className="max-w-[760px]">
        <p className="text-2xl font-medium text-[#222222] mb-6">Paso 1</p>
        <h1 className="text-6xl lg:text-7xl leading-[1.05] font-semibold text-[#222222] mb-8">
          Describe tu espacio
        </h1>
        <p className="text-2xl lg:text-3xl leading-[1.35] text-[#222222]">
          En este paso, te preguntaremos qué tipo de propiedad tienes y si los huéspedes reservarán el
          alojamiento entero o solo una habitación. A continuación, indícanos la ubicación y cuántos huéspedes
          pueden quedarse.
        </p>
      </div>

      <div className="flex justify-center lg:justify-end">
        <Image
          src="https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80"
          alt="Ilustración de casa"
          width={760}
          height={520}
          className="w-[90%] max-w-[760px] rounded-3xl object-cover shadow-sm"
          priority
        />
      </div>
    </section>
  )
}
