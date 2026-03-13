'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { propertiesApi } from '@/lib/api/properties'
import { experiencesApi } from '@/lib/api/experiences'
import type { Property } from '@/types'
import type { Experience } from '@/types/experience'

interface ServiceDraft {
  serviceName: string
  category: string
  city: string
}

interface ExperienceDraft {
  title: string
  category: string
  durationHours: number
  capacity: number
}

export default function HostListingsPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft | null>(null)
  const [experienceDraft, setExperienceDraft] = useState<ExperienceDraft | null>(null)

  useEffect(() => {
    propertiesApi
      .getMyProperties()
      .then(setProperties)
      .catch(() => setProperties([]))

    experiencesApi
      .getMyExperiences()
      .then(setExperiences)
      .catch(() => setExperiences([]))

    if (typeof window !== 'undefined') {
      const serviceRaw = window.localStorage.getItem('host-draft-service')
      if (serviceRaw) {
        try {
          setServiceDraft(JSON.parse(serviceRaw))
        } catch {
          setServiceDraft(null)
        }
      }
      const expRaw = window.localStorage.getItem('host-draft-experience')
      if (expRaw) {
        try {
          setExperienceDraft(JSON.parse(expRaw))
        } catch {
          setExperienceDraft(null)
        }
      }
    }
  }, [])

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="h-20" />

      <section className="max-w-[1200px] mx-auto px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-semibold text-[#222222] mb-8">Tus anuncios</h1>

        <div className="grid gap-6 md:grid-cols-3">
          {properties.map((property) => (
            <div
              key={property.id}
              className="rounded-3xl border border-[#DDDDDD] bg-[#F7F7F7] overflow-hidden flex flex-col"
            >
              <div className="h-44 bg-[#F7F7F7] flex items-center justify-center">
                <span className="text-5xl text-[#FF385C] font-semibold">∞</span>
              </div>
              <div className="px-4 py-3 space-y-1">
                <p className="text-xs font-medium text-[#FFB400]">
                  {property.status === 'PUBLISHED' ? 'Publicado' : 'En progreso'}
                </p>
                <p className="text-sm font-semibold text-[#222222] truncate">
                  {property.title}
                </p>
                <p className="text-xs text-[#717171]">
                  Alojamiento en {property.city}, {property.country}
                </p>
              </div>
            </div>
          ))}

          {serviceDraft && (
            <div className="rounded-3xl border border-[#DDDDDD] bg-[#F7F7F7] overflow-hidden flex flex-col">
              <div className="h-44 bg-[#F7F7F7]" />
              <div className="px-4 py-3 space-y-1">
                <p className="text-xs font-medium text-[#FFB400]">En progreso</p>
                <p className="text-sm font-semibold text-[#222222] truncate">
                  {serviceDraft.serviceName}
                </p>
                <p className="text-xs text-[#717171]">
                  Servicio en {serviceDraft.city}
                </p>
              </div>
            </div>
          )}

          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="rounded-3xl border border-[#DDDDDD] bg-[#F7F7F7] overflow-hidden flex flex-col"
            >
              <div className="h-44 bg-[#F7F7F7]" />
              <div className="px-4 py-3 space-y-1">
                <p className="text-xs font-medium text-[#FFB400]">
                  {exp.status === 'PUBLISHED' ? 'Publicado' : 'En progreso'}
                </p>
                <p className="text-sm font-semibold text-[#222222] truncate">
                  {exp.title}
                </p>
                <p className="text-xs text-[#717171]">
                  {exp.category} · {exp.city}
                </p>
              </div>
            </div>
          ))}

          {!serviceDraft && experienceDraft && (
            <div className="rounded-3xl border border-[#DDDDDD] bg-[#F7F7F7] overflow-hidden flex flex-col">
              <div className="h-44 bg-[#F7F7F7]" />
              <div className="px-4 py-3 space-y-1">
                <p className="text-xs font-medium text-[#FFB400]">En progreso</p>
                <p className="text-sm font-semibold text-[#222222] truncate">
                  {experienceDraft.title}
                </p>
                <p className="text-xs text-[#717171]">
                  Experiencia · {experienceDraft.category}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}

