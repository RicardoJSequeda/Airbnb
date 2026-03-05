'use client'

import { useState } from 'react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import Link from 'next/link'

export default function HostExperienciaPage() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [duration, setDuration] = useState('2')
  const [capacity, setCapacity] = useState('6')
  const [message, setMessage] = useState<string | null>(null)

  const canSave = title.trim() && category.trim() && Number(duration) > 0

  const handleSaveDraft = () => {
    if (!canSave) {
      setMessage('Completa título, categoría y duración para guardar el borrador de experiencia.')
      return
    }

    localStorage.setItem(
      'host-draft-experience',
      JSON.stringify({ title, category, durationHours: Number(duration), capacity: Number(capacity) })
    )
    setMessage('Borrador de experiencia guardado correctamente.')
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="h-20" />
      <section className="mx-auto max-w-[820px] px-6 py-14">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-primary">Flujo de anfitrión</p>
        <h1 className="text-3xl font-semibold text-secondary mb-3">Publicar experiencia</h1>
        <p className="text-secondary leading-relaxed mb-8">
          Define una experiencia inicial y guarda un borrador para continuar con agenda, precios y fotos.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 md:col-span-2">
            <span className="text-sm font-medium text-secondary">Título</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-lg border border-[#DDDDDD] px-3 py-2 outline-none focus:ring-2 focus:ring-[#222222]"
              placeholder="Ej: Tour gastronómico local"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-secondary">Categoría</span>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-[#DDDDDD] px-3 py-2 outline-none focus:ring-2 focus:ring-[#222222]"
              placeholder="Gastronomía"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-secondary">Duración (horas)</span>
            <input
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="rounded-lg border border-[#DDDDDD] px-3 py-2 outline-none focus:ring-2 focus:ring-[#222222]"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-secondary">Capacidad máxima</span>
            <input
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="rounded-lg border border-[#DDDDDD] px-3 py-2 outline-none focus:ring-2 focus:ring-[#222222]"
            />
          </label>
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
          <Link href="/host/onboarding?type=experiencia" className="text-sm font-medium text-primary hover:underline">
            Volver al onboarding
          </Link>
        </div>
      </section>
      <Footer />
    </main>
  )
}
