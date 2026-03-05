'use client'

import { useState } from 'react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import Link from 'next/link'
import HostServiceStepCard from '@/components/host-service/HostServiceStepCard'
import { hostServiceSteps } from '@/components/host-service/host-service-data'

export default function HostServicioPage() {
  const [serviceName, setServiceName] = useState('')
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const handleSaveDraft = () => {
    if (!serviceName.trim() || !category.trim() || !city.trim()) {
      setMessage('Completa nombre, categoría y ciudad para iniciar la publicación.')
      return
    }

    localStorage.setItem(
      'host-draft-service',
      JSON.stringify({ serviceName, category, city })
    )
    setMessage('Borrador de servicio guardado. Siguiente paso: disponibilidad y precios.')
  }

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

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <input
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            className="rounded-lg border border-[#DDDDDD] px-3 py-2 outline-none focus:ring-2 focus:ring-[#222222]"
            placeholder="Nombre del servicio"
          />
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-[#DDDDDD] px-3 py-2 outline-none focus:ring-2 focus:ring-[#222222]"
            placeholder="Categoría"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="rounded-lg border border-[#DDDDDD] px-3 py-2 outline-none focus:ring-2 focus:ring-[#222222]"
            placeholder="Ciudad"
          />
        </div>

        {message ? <p className="mt-4 text-sm text-[#484848]">{message}</p> : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded-full bg-[#222222] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Guardar borrador
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
