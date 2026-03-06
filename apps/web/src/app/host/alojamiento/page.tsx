'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AccommodationFlowLayout } from '@/components/host-accommodation/AccommodationFlowLayout'
import { AmenitiesStep } from '@/components/host-accommodation/AmenitiesStep'
import { BasicsStep } from '@/components/host-accommodation/BasicsStep'
import { PhotoArrangeStep } from '@/components/host-accommodation/PhotoArrangeStep'
import { PhotosStep } from '@/components/host-accommodation/PhotosStep'
import { GuestAccessStep } from '@/components/host-accommodation/GuestAccessStep'
import { StandOutStep } from '@/components/host-accommodation/StandOutStep'
import { IntroStep } from '@/components/host-accommodation/IntroStep'
import { LocationStep } from '@/components/host-accommodation/LocationStep'
import { PropertyTypeStep } from '@/components/host-accommodation/PropertyTypeStep'
import type { AccommodationDraft, AccommodationStepKey } from '@/components/host-accommodation/types'

const STEPS: AccommodationStepKey[] = ['intro', 'propertyType', 'guestAccess', 'location', 'basics', 'standOut', 'amenities', 'photos', 'photoArrange']
/** [fin segmento 1, fin segmento 2]. Segmento 2 = standOut + amenities + photos + photoArrange. */
const SEGMENT_BOUNDARIES: [number, number] = [5, 9]
const STORAGE_KEY = 'host-draft-accommodation'
const DEFAULT_GUESTS = 4
const DEFAULT_BEDS = 2
const DEFAULT_BATHROOMS = 2

function getInitialDraft(): AccommodationDraft {
  if (typeof window === 'undefined') {
    return {
      propertyTypeId: null,
      guestAccessId: null,
      address: null,
      latitude: null,
      longitude: null,
      guests: DEFAULT_GUESTS,
      beds: DEFAULT_BEDS,
      bathrooms: DEFAULT_BATHROOMS,
      amenityIds: [],
      outstandingAmenityIds: [],
      securityElementIds: [],
      photoCount: 0,
    }
  }

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return {
      propertyTypeId: null,
      guestAccessId: null,
      address: null,
      latitude: null,
      longitude: null,
      guests: DEFAULT_GUESTS,
      beds: DEFAULT_BEDS,
      bathrooms: DEFAULT_BATHROOMS,
      amenityIds: [],
      outstandingAmenityIds: [],
      securityElementIds: [],
      photoCount: 0,
    }
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AccommodationDraft>
    return {
      propertyTypeId: parsed.propertyTypeId ?? null,
      guestAccessId: parsed.guestAccessId ?? null,
      address: parsed.address ?? null,
      latitude: parsed.latitude ?? null,
      longitude: parsed.longitude ?? null,
      guests: typeof parsed.guests === 'number' ? parsed.guests : DEFAULT_GUESTS,
      beds: typeof parsed.beds === 'number' ? parsed.beds : DEFAULT_BEDS,
      bathrooms: typeof parsed.bathrooms === 'number' ? parsed.bathrooms : DEFAULT_BATHROOMS,
      amenityIds: Array.isArray(parsed.amenityIds) ? parsed.amenityIds : [],
      outstandingAmenityIds: Array.isArray(parsed.outstandingAmenityIds) ? parsed.outstandingAmenityIds : [],
      securityElementIds: Array.isArray(parsed.securityElementIds) ? parsed.securityElementIds : [],
      photoCount: typeof parsed.photoCount === 'number' ? parsed.photoCount : 0,
    }
  } catch {
    return {
      propertyTypeId: null,
      guestAccessId: null,
      address: null,
      latitude: null,
      longitude: null,
      guests: DEFAULT_GUESTS,
      beds: DEFAULT_BEDS,
      bathrooms: DEFAULT_BATHROOMS,
      amenityIds: [],
      outstandingAmenityIds: [],
      securityElementIds: [],
      photoCount: 0,
    }
  }
}

export default function HostAlojamientoPage() {
  const router = useRouter()
  const initialDraft = getInitialDraft()
  const [stepIndex, setStepIndex] = useState(0)
  const [propertyTypeId, setPropertyTypeId] = useState<string | null>(initialDraft.propertyTypeId)
  const [guestAccessId, setGuestAccessId] = useState<string | null>(initialDraft.guestAccessId)
  const [address, setAddress] = useState<string>(initialDraft.address ?? '')
  const [latitude, setLatitude] = useState<number | null>(initialDraft.latitude ?? null)
  const [longitude, setLongitude] = useState<number | null>(initialDraft.longitude ?? null)
  const [guests, setGuests] = useState(initialDraft.guests)
  const [beds, setBeds] = useState(initialDraft.beds)
  const [bathrooms, setBathrooms] = useState(initialDraft.bathrooms)
  const [amenityIds, setAmenityIds] = useState<string[]>(initialDraft.amenityIds)
  const [outstandingAmenityIds, setOutstandingAmenityIds] = useState<string[]>(
    initialDraft.outstandingAmenityIds
  )
  const [securityElementIds, setSecurityElementIds] = useState<string[]>(
    initialDraft.securityElementIds
  )
  const [photoUrls, setPhotoUrls] = useState<string[]>([])

  const currentStep = STEPS[stepIndex]

  const toggleAmenity = (id: string) => {
    setAmenityIds((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }
  const toggleOutstandingAmenity = (id: string) => {
    setOutstandingAmenityIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }
  const toggleSecurityElement = (id: string) => {
    setSecurityElementIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  const canGoNext = useMemo(() => {
    if (currentStep === 'intro') return true
    if (currentStep === 'propertyType') return Boolean(propertyTypeId)
    if (currentStep === 'guestAccess') return Boolean(guestAccessId)
    if (currentStep === 'location') return address.trim().length > 0
    if (currentStep === 'basics') return true
    if (currentStep === 'standOut') return true
    if (currentStep === 'amenities') return true
    if (currentStep === 'photos') return photoUrls.length >= 5
    return false
  }, [currentStep, propertyTypeId, guestAccessId, address, photoUrls.length])

  const handleBack = () => {
    if (stepIndex === 0) {
      router.push('/host/onboarding?type=alojamiento')
      return
    }
    setStepIndex((prev) => prev - 1)
  }

  const handleNext = () => {
    if (!canGoNext) return

    if (stepIndex < STEPS.length - 1) {
      setStepIndex((prev) => prev + 1)
      return
    }

    const draft: AccommodationDraft = {
      propertyTypeId,
      guestAccessId,
      address: address.trim() || null,
      latitude,
      longitude,
      guests,
      beds,
      bathrooms,
      amenityIds,
      outstandingAmenityIds,
      securityElementIds,
      photoCount: photoUrls.length,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    router.push('/host')
  }

  return (
    <AccommodationFlowLayout
      currentStep={stepIndex}
      totalSteps={STEPS.length}
      segmentBoundaries={SEGMENT_BOUNDARIES}
      onBack={handleBack}
      onNext={handleNext}
      canGoNext={canGoNext}
    >
      {currentStep === 'intro' ? <IntroStep /> : null}
      {currentStep === 'propertyType' ? (
        <PropertyTypeStep selectedTypeId={propertyTypeId} onSelect={setPropertyTypeId} />
      ) : null}
      {currentStep === 'guestAccess' ? (
        <GuestAccessStep selectedAccessId={guestAccessId} onSelect={setGuestAccessId} />
      ) : null}
      {currentStep === 'location' ? (
        <LocationStep
          address={address}
          onAddressChange={setAddress}
          latitude={latitude}
          longitude={longitude}
          onLocationChange={(lat, lng) => {
            setLatitude(lat)
            setLongitude(lng)
          }}
        />
      ) : null}
      {currentStep === 'basics' ? (
        <BasicsStep
          guests={guests}
          beds={beds}
          bathrooms={bathrooms}
          onGuestsChange={setGuests}
          onBedsChange={setBeds}
          onBathroomsChange={setBathrooms}
        />
      ) : null}
      {currentStep === 'standOut' ? <StandOutStep /> : null}
      {currentStep === 'amenities' ? (
        <AmenitiesStep
          selectedIds={amenityIds}
          onToggle={toggleAmenity}
          outstandingIds={outstandingAmenityIds}
          onToggleOutstanding={toggleOutstandingAmenity}
          securityIds={securityElementIds}
          onToggleSecurity={toggleSecurityElement}
        />
      ) : null}
      {currentStep === 'photos' ? (
        <PhotosStep photoUrls={photoUrls} onPhotosChange={setPhotoUrls} />
      ) : null}
      {currentStep === 'photoArrange' ? (
        <PhotoArrangeStep photoUrls={photoUrls} onPhotosChange={setPhotoUrls} />
      ) : null}
    </AccommodationFlowLayout>
  )
}
