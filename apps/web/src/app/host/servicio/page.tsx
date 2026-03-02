import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import Link from 'next/link'
import HostServiceStepCard from '@/components/host-service/HostServiceStepCard'
import { hostServiceSteps } from '@/components/host-service/host-service-data'

export default function HostServicioPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="h-20" />

      <section className="mx-auto max-w-5xl px-6 py-14">
        <p className="mb-3 text-sm font-medium uppercase tracking-wide text-primary">Anfitrión de servicios</p>
        <h1 className="mb-4 text-3xl font-semibold text-[#222222] md:text-4xl">Publica tu servicio profesional</h1>
        <p className="max-w-3xl text-base leading-relaxed text-[#6A6A6A] md:text-lg">
          Ya puedes iniciar un flujo guiado para crear tu servicio. Diseñamos esta versión modular para escalar
          fácilmente nuevas categorías, validaciones y reglas de publicación.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {hostServiceSteps.map((item) => (
            <HostServiceStepCard
              key={item.step}
              step={item.step}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="rounded-full bg-[#222222] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Comenzar publicación
          </button>
          <Link href="/host" className="text-sm font-medium text-primary hover:underline">
            Volver a anfitrión
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
