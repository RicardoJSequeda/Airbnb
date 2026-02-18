'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import {
  ExperienceGallery,
  ExperienceHero,
  ExperienceDescription,
  ExperienceHostCard,
  ExperienceWhatYouWillDo,
  ExperienceReviewsSection,
  ExperienceLocation,
  ExperienceKnowSection,
  ExperienceBookingCard,
  type ExperienceStep,
  type ExperienceSlot,
} from '@/components/experience-detail'
import { publicExperiencesApi } from '@/lib/api/experiences'
import { parseErrorMessage } from '@/lib/utils/parse-error'
import type { Experience } from '@/types/experience'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

function buildMockSlots(durationMinutes: number, count: number): ExperienceSlot[] {
  const slots: ExperienceSlot[] = []
  const startHour = 8
  const startMin = 0
  const endTotalMin = startHour * 60 + startMin + durationMinutes
  const endHour = Math.floor(endTotalMin / 60) % 24
  const endMin = endTotalMin % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  const startStr = `${startHour}:${pad(startMin)} a.m.`
  const endStr = endHour >= 12 ? `${endHour - 12 || 12}:${pad(endMin)} p.m.` : `${endHour}:${pad(endMin)} a.m.`
  const timeRange = `${startStr} - ${endStr}`

  for (let i = 0; i < count; i++) {
    const d = addDays(new Date(), i + 1)
    const dayName = format(d, 'EEEE', { locale: es })
    const dateLabel = i === 0 ? `Mañana, ${format(d, 'd \'de\' MMMM', { locale: es })}` : `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${format(d, 'd \'de\' MMMM', { locale: es })}`
    slots.push({
      id: `slot-${i}`,
      dateLabel,
      timeRange,
      spotsLeft: Math.floor(Math.random() * 5) + 4,
    })
  }
  return slots
}

function buildSteps(experience: Experience): ExperienceStep[] {
  const includes = experience.includes ?? []
  if (includes.length > 0) {
    return includes.map((text, i) => ({
      title: text,
      description: experience.description?.slice(0, 120) + (experience.description && experience.description.length > 120 ? '...' : '') || 'Parte de esta experiencia.',
    }))
  }
  return [
    {
      title: experience.title,
      description: experience.description?.slice(0, 200) || 'Descubre esta experiencia con el anfitrión.',
    },
  ]
}

export default function ExperienceDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [experience, setExperience] = useState<Experience | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    if (!id) return
    publicExperiencesApi
      .getById(id)
      .then(setExperience)
      .catch((err) => setError(parseErrorMessage(err, 'Error al cargar la experiencia')))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="h-20" />
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="aspect-[16/10] bg-gray-200 rounded-xl" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-24 bg-gray-200 rounded" />
              </div>
              <div className="h-64 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !experience) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="h-20" />
        <div className="max-w-[1280px] mx-auto px-6 py-12">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error || 'Experiencia no encontrada'}</p>
          </div>
          <Link href="/experiences" className="mt-4 inline-block text-primary hover:underline">
            Volver a experiencias
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const images = Array.isArray(experience.images) ? experience.images : []
  const reviews = experience.reviews ?? []
  const rating = experience.averageRating ?? 0
  const totalReviews = experience.totalReviews ?? 0
  const steps = buildSteps(experience)
  const firstImage = images[0]
  const slots = buildMockSlots(experience.duration ?? 480, 6)
  const originalPrice = experience.pricePerParticipant != null && experience.pricePerParticipant > 0
    ? Math.round(experience.pricePerParticipant * 1.1)
    : undefined

  return (
    <main className="min-h-screen bg-white">
      <Header />

      <div className="h-8 md:h-9" />

      <div className="max-w-[1280px] mx-auto px-6 md:px-10 lg:px-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-14">
          <div className="min-w-0 space-y-10">
            <ExperienceGallery images={images} title={experience.title} />

            <ExperienceHero
              title={experience.title}
              averageRating={rating}
              totalReviews={totalReviews}
              category={experience.category}
              city={experience.city}
              isFavorite={isFavorite}
              onFavoriteToggle={() => setIsFavorite((v) => !v)}
            />

            <ExperienceDescription
              description={experience.description}
              languages={experience.languages}
            />

            {experience.host && (
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <ExperienceHostCard
                  hostName={experience.host.name}
                  hostAvatar={experience.host.avatar}
                  hostDescription={experience.title}
                />
              </div>
            )}

            <ExperienceWhatYouWillDo steps={steps} fallbackImage={firstImage} />

            <ExperienceReviewsSection
              averageRating={rating}
              totalReviews={totalReviews}
              reviews={reviews}
            />

            <ExperienceLocation
              title={experience.title}
              address={experience.address || experience.meetingPoint || ''}
              city={experience.city}
              latitude={experience.latitude}
              longitude={experience.longitude}
            />

            <ExperienceKnowSection />
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <ExperienceBookingCard
              experienceId={experience.id}
              pricePerParticipant={experience.pricePerParticipant}
              currency={experience.currency}
              originalPrice={originalPrice}
              slots={slots}
            />
          </div>
        </div>

        <section className="mt-16 pt-10 border-t border-gray-200 text-center space-y-4">
          <p className="text-sm text-text-2">Para proteger tus pagos, usa siempre Airbnb a la hora de transferir dinero y comunicarte con los anfitriones.</p>
          <div className="pt-6 pb-2">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-amber-400/80 bg-amber-50/80 mb-3">
              <span className="text-2xl" aria-hidden>◇</span>
            </div>
            <p className="font-semibold text-secondary">Recorridos culturales con calidad verificada</p>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
