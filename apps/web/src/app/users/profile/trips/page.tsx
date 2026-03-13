import Image from 'next/image'

export default function TripsPage() {
  return (
    <div className="flex flex-col animate-in fade-in duration-300">
      <h2 className="text-[32px] font-bold text-neutral-900 mb-16">
        Viajes anteriores
      </h2>
      
      <div className="flex flex-col items-center justify-center mt-8 text-center px-4">
        <div className="relative w-[280px] h-[280px] mb-8">
          <Image 
            src="/icons/maleta.avif" 
            alt="Maleta" 
            fill 
            className="object-contain"
            priority
          />
        </div>
        
        <p className="text-[15px] text-neutral-800 font-normal mb-8 max-w-[340px] leading-relaxed">
          Después de tu primer viaje con Airbnb, encontrarás aquí tus reservaciones anteriores.
        </p>
        
        <button className="bg-[#FF385C] hover:bg-[#D70466] text-white px-6 py-3.5 rounded-xl text-[15px] font-semibold transition-colors">
          Reserva un viaje
        </button>
      </div>
    </div>
  )
}
