import Image from 'next/image'

export function StandOutStep() {
  return (
    <section className="h-full min-h-0 w-full max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center px-4 sm:px-6 py-6 lg:py-8">
      {/* Columna izquierda: texto */}
      <div className="max-w-[520px]">
        <p className="text-sm font-semibold text-[#222222] mb-3">Paso 2</p>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl leading-tight font-semibold text-[#222222] mb-4">
          Haz que tu espacio se destaque
        </h1>
        <p className="text-base lg:text-lg leading-relaxed text-[#222222]">
          En este paso deberás agregar algunas de las comodidades que ofrece tu espacio y al menos
          cinco fotos. Luego, deberás crear un título y una descripción.
        </p>
      </div>

      {/* Columna derecha: ilustración */}
      <div className="flex justify-center lg:justify-end">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
          alt="Espacio interior destacado"
          width={560}
          height={400}
          className="w-full max-w-[480px] lg:max-w-[520px] rounded-xl object-cover shadow-sm"
          priority
        />
      </div>
    </section>
  )
}
