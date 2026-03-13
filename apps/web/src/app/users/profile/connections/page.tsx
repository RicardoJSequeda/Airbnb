import Image from 'next/image'
import Link from 'next/link'

export default function ConnectionsPage() {
  return (
    <div className="flex flex-col animate-in fade-in duration-300 min-h-[50vh] justify-center pt-10">
      <div className="flex flex-col items-center justify-center text-center px-4">
        <div className="relative w-[360px] h-[220px] mb-8">
          <Image
            src="/icons/familia.avif"
            alt="Conexiones"
            fill
            className="object-contain"
            priority
          />
        </div>

        <p className="text-[15px] text-neutral-800 font-normal mb-8 max-w-[340px] leading-relaxed">
          Cuando te unas a una Experiencia o invites a alguien a un viaje, aquí encontrarás los perfiles de otros huéspedes.{' '}
          <Link href="#" className="underline font-semibold hover:text-black transition-colors">
            Más información
          </Link>
        </p>

        <Link
          href="/"
          prefetch
          className="bg-[#FF385C] hover:bg-[#D70466] text-white px-6 py-3.5 rounded-xl text-[15px] font-semibold transition-colors inline-block"
        >
          Reserva un viaje
        </Link>
      </div>
    </div>
  )
}
