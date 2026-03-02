'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import {
  ExperienceHostCard,
  ExperienceWhatYouWillDo,
  ExperienceReviewsSection,
  ExperienceWhereWeMeet,
  ExperienceHostAboutSection,
  ExperienceLocation,
  ExperienceStickySummary,
  ExperienceCancellationPolicy,
  ExperienceQualityVerified,
  ExperienceReportListing,
  SelectTimeModal,
  type ExperienceStep,
  type ExperienceSlot,
} from '@/components/experience-detail'
import type { Experience } from '@/types/experience'
import { useExperienceDetail } from '@/features/experiences/hooks/useExperienceDetail'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

const TIME_SLOTS_DAY = [
  { start: 10, startMin: 0, end: 12, endMin: 15 },   // 10:00 a.m. – 12:15 p.m.
  { start: 17, startMin: 0, end: 19, endMin: 15 },   // 5:00 – 7:15 p.m.
]

function buildMockSlots(durationMinutes: number, count: number): ExperienceSlot[] {
  const slots: ExperienceSlot[] = []
  const pad = (n: number) => n.toString().padStart(2, '0')
  let id = 0
  for (let i = 0; i < count; i++) {
    const d = addDays(new Date(), i + 1)
    const dayName = format(d, 'EEEE', { locale: es })
    const dateLabel = i === 0 ? `Mañana, ${format(d, 'd \'de\' MMMM', { locale: es })}` : `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${format(d, 'd \'de\' MMMM', { locale: es })}`
    for (const t of TIME_SLOTS_DAY) {
      const startStr = t.start >= 12 ? `${t.start - 12 || 12}:${pad(t.startMin)} p.m.` : `${t.start}:${pad(t.startMin)} a.m.`
      const endStr = t.end >= 12 ? `${t.end - 12 || 12}:${pad(t.endMin)} p.m.` : `${t.end}:${pad(t.endMin)} a.m.`
      const timeRange = `${startStr} – ${endStr}`
      slots.push({
        id: `slot-${id++}`,
        dateLabel,
        timeRange,
        spotsLeft: Math.floor(Math.random() * 5) + 6,
        date: format(d, 'yyyy-MM-dd'),
      })
    }
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
  const router = useRouter()
  const id = params.id as string
  const { experience, loading, error } = useExperienceDetail(id)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectTimeModalOpen, setSelectTimeModalOpen] = useState(false)

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

      {/* Sin overflow aquí: overflow-x-hidden rompe position:sticky. La columna derecha tiene min-height + padding-bottom para que al llegar al final del contenido la izquierda no se "levante". */}
      <div className="max-w-[1120px] mx-auto px-6 md:px-10 lg:px-12 pt-[7.5rem] pb-24 scroll-smooth">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,42%)_minmax(0,58%)] gap-12 items-start">
          {/* COLUMNA IZQUIERDA (STICKY): se mantiene fija mientras la derecha hace scroll; el padding-bottom de la derecha evita que se suelte al final */}
          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-hidden">
            <ExperienceStickySummary
              experienceId={experience.id}
              title={experience.title}
              imageUrl={images[0]}
              hostName={experience.host?.name}
              hostAvatar={experience.host?.avatar ?? null}
              hostOccupation={experience.hostOccupation ?? null}
              city={experience.city}
              category={experience.category}
              meetingPoint={experience.meetingPoint ?? experience.address ?? null}
              averageRating={rating}
              totalReviews={totalReviews}
              isFavorite={isFavorite}
              onFavoriteToggle={() => setIsFavorite((v) => !v)}
              pricePerParticipant={experience.pricePerParticipant}
              currency={experience.currency}
              originalPrice={originalPrice}
              slots={slots}
              onShowDates={() => setSelectTimeModalOpen(true)}
            />
          </aside>

          {/* COLUMNA DERECHA: min-height + espaciador final para que la fila del grid sea más alta que el contenido y la sticky izquierda no se alce al llegar al final */}
          <div className="min-w-0 space-y-12 pb-8 min-h-[calc(100vh-8rem)]">
            <div className="space-y-4">
              {experience.host && (
                <ExperienceHostCard
                  hostId={experience.host.id}
                  hostName={experience.host.name}
                  hostAvatar={experience.host.avatar}
                  hostOccupation={experience.hostOccupation}
                />
              )}
              <ExperienceLocation
                title={experience.title}
                address={experience.address || experience.meetingPoint || ''}
                city={experience.city}
                latitude={experience.latitude}
                longitude={experience.longitude}
              />
            </div>

            <ExperienceWhatYouWillDo steps={steps} fallbackImage={firstImage} />

            <ExperienceReviewsSection
              averageRating={rating}
              totalReviews={totalReviews}
              reviews={reviews}
            />

            <ExperienceWhereWeMeet
              meetingPoint={experience.meetingPoint}
              address={experience.address}
              city={experience.city}
              country={experience.country}
              latitude={experience.latitude}
              longitude={experience.longitude}
            />

            {experience.host && (
              <ExperienceHostAboutSection
                hostId={experience.host.id}
                hostName={experience.host.name}
                hostAvatar={experience.host.avatar}
                hostOccupation={experience.hostOccupation}
                hostBio={experience.hostBio}
                registrationNumber={experience.hostRegistrationNumber}
              />
            )}

            <ExperienceCancellationPolicy />

            <ExperienceQualityVerified category={experience.category} />

            <ExperienceReportListing />

            {/* Espaciador: hace que la fila del grid sea más alta que el contenido + viewport, así la columna izquierda sticky no se "alza" al hacer scroll hasta el final */}
            <div className="lg:min-h-[150vh]" aria-hidden />
          </div>
        </div>

        <SelectTimeModal
          isOpen={selectTimeModalOpen}
          onClose={() => setSelectTimeModalOpen(false)}
          experienceId={experience.id}
          experienceTitle={experience.title}
          slots={slots}
          pricePerParticipant={experience.pricePerParticipant}
          currency={experience.currency}
          durationMinutes={experience.duration ?? 90}
          imageUrl={images[0]}
          onSelectSlot={(slot, adults, children) => {
            setSelectTimeModalOpen(false)
            const q = new URLSearchParams({ slot: slot.id, adults: String(adults), children: String(children) })
            router.push(`/experiences/${experience.id}/book?${q.toString()}`)
          }}
        />
      </div>

      <Footer />
    </main>
  )
}
