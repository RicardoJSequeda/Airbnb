'use client'

import { useCallback, useEffect, useState } from 'react'
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
import { TitleStep } from '@/components/host-accommodation/TitleStep'
import { DescriptionStep } from '@/components/host-accommodation/DescriptionStep'
import { HighlightsStep } from '@/components/host-accommodation/HighlightsStep'
import { FinishIntroStep } from '@/components/host-accommodation/FinishIntroStep'
import { ReservationPreferencesStep } from '@/components/host-accommodation/ReservationPreferencesStep'
import { BasePriceStep } from '@/components/host-accommodation/BasePriceStep'
import { WeekendPriceStep } from '@/components/host-accommodation/WeekendPriceStep'
import { DiscountsStep } from '@/components/host-accommodation/DiscountsStep'
import { SecurityInfoStep } from '@/components/host-accommodation/SecurityInfoStep'
import { FinalDetailsStep } from '@/components/host-accommodation/FinalDetailsStep'
import type {
  AccommodationDraft,
  AccommodationStepKey,
} from '@/components/host-accommodation/types'
import { propertiesApi } from '@/lib/api/properties'
import { parseErrorCode } from '@/lib/utils/parse-error'
import { trackHostWizardEvent } from '@/lib/analytics/host-wizard'

const STEPS: AccommodationStepKey[] = [
  'intro',
  'propertyType',
  'guestAccess',
  'location',
  'basics',
  'standOut',
  'amenities',
  'photos',
  'photoArrange',
  'title',
  'description',
  'highlights',
  'finishIntro',
  'reservationPreferences',
  'basePrice',
  'weekendPrice',
  'discounts',
  'securityInfo',
  'finalDetails',
]
/** [fin segmento 1, fin segmento 2]. Segmento 2 = standOut + amenities + photos + photoArrange + title + description + highlights + finishIntro + precios. */
const SEGMENT_BOUNDARIES: [number, number] = [5, 17]
const STORAGE_KEY = 'host-draft-accommodation'
const STORAGE_DRAFT_ID_KEY = 'host-draft-accommodation-id'
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
      title: null,
      description: null,
      highlights: [],
      reservationPreference: null,
      basePrice: null,
      weekendPremiumPercent: null,
      discounts: [],
      hasSecurityCameraOutside: false,
      hasNoiseMonitor: false,
      hasWeapons: false,
      finalCountry: null,
      finalAddress: '',
      finalAddressExtra: '',
      finalCity: '',
      finalRegion: '',
      isBusinessHost: null,
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
      title: null,
      description: null,
      highlights: [],
      reservationPreference: null,
      basePrice: null,
      weekendPremiumPercent: null,
      discounts: [],
      hasSecurityCameraOutside: false,
      hasNoiseMonitor: false,
      hasWeapons: false,
      finalCountry: null,
      finalAddress: '',
      finalAddressExtra: '',
      finalCity: '',
      finalRegion: '',
      isBusinessHost: null,
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
      title: parsed.title ?? null,
      description: parsed.description ?? null,
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      reservationPreference: parsed.reservationPreference ?? null,
      basePrice: typeof parsed.basePrice === 'number' ? parsed.basePrice : null,
      weekendPremiumPercent:
        typeof parsed.weekendPremiumPercent === 'number' ? parsed.weekendPremiumPercent : null,
      discounts: Array.isArray(parsed.discounts) ? parsed.discounts : [],
      hasSecurityCameraOutside: parsed.hasSecurityCameraOutside ?? false,
      hasNoiseMonitor: parsed.hasNoiseMonitor ?? false,
      hasWeapons: parsed.hasWeapons ?? false,
      finalCountry: parsed.finalCountry ?? null,
      finalAddress: parsed.finalAddress ?? '',
      finalAddressExtra: parsed.finalAddressExtra ?? '',
      finalCity: parsed.finalCity ?? '',
      finalRegion: parsed.finalRegion ?? '',
      isBusinessHost: parsed.isBusinessHost ?? null,
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
      title: null,
      description: null,
      highlights: [],
      reservationPreference: null,
      basePrice: null,
      weekendPremiumPercent: null,
      discounts: [],
      hasSecurityCameraOutside: false,
      hasNoiseMonitor: false,
      hasWeapons: false,
      finalCountry: null,
      finalAddress: '',
      finalAddressExtra: '',
      finalCity: '',
      finalRegion: '',
      isBusinessHost: null,
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
  const [title, setTitle] = useState<string>(initialDraft.title ?? '')
  const [description, setDescription] = useState<string>(initialDraft.description ?? '')
  const [highlights, setHighlights] = useState<string[]>(initialDraft.highlights ?? [])
  const [reservationPreference, setReservationPreference] = useState<
    AccommodationDraft['reservationPreference']
  >(initialDraft.reservationPreference ?? null)
  const [basePrice, setBasePrice] = useState<number | null>(initialDraft.basePrice ?? null)
  const [weekendPremiumPercent, setWeekendPremiumPercent] = useState<number | null>(
    initialDraft.weekendPremiumPercent ?? 7
  )
  const [discounts, setDiscounts] = useState<string[]>(initialDraft.discounts ?? [])
  const [hasSecurityCameraOutside, setHasSecurityCameraOutside] = useState(
    initialDraft.hasSecurityCameraOutside ?? false
  )
  const [hasNoiseMonitor, setHasNoiseMonitor] = useState(initialDraft.hasNoiseMonitor ?? false)
  const [hasWeapons, setHasWeapons] = useState(initialDraft.hasWeapons ?? false)
  const [finalCountry, setFinalCountry] = useState<string>(initialDraft.finalCountry ?? 'Colombia')
  const [finalAddress, setFinalAddress] = useState<string>(initialDraft.finalAddress ?? '')
  const [finalAddressExtra, setFinalAddressExtra] = useState<string>(
    initialDraft.finalAddressExtra ?? ''
  )
  const [finalCity, setFinalCity] = useState<string>(initialDraft.finalCity ?? '')
  const [finalRegion, setFinalRegion] = useState<string>(initialDraft.finalRegion ?? '')
  const [isBusinessHost, setIsBusinessHost] = useState<boolean | null>(
    initialDraft.isBusinessHost ?? null
  )
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [draftPropertyId, setDraftPropertyId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(STORAGE_DRAFT_ID_KEY)
  })

  const currentStep = STEPS[stepIndex]

  useEffect(() => {
    trackHostWizardEvent('host_wizard_step_view', {
      step: currentStep,
      stepIndex,
      totalSteps: STEPS.length,
    })
  }, [currentStep, stepIndex])

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

  const buildPropertyPayload = useCallback(() => {
    const safeLatitude = latitude ?? 0
    const safeLongitude = longitude ?? 0
    const price = basePrice ?? 0

    return {
      title: (title.trim() || 'Nuevo alojamiento') as string,
      description:
        (description.trim() || 'Alojamiento creado desde el flujo de anfitrión.') as string,
      price,
      currency: 'COP',
      maxGuests: guests,
      bedrooms: beds,
      bathrooms,
      propertyType: propertyTypeId || 'casa',
      address: (address.trim() || finalAddress || 'Pendiente') as string,
      city: (finalCity || 'Ciudad') as string,
      state: finalRegion || undefined,
      country: finalCountry || 'Colombia',
      zipCode: undefined,
      latitude: safeLatitude,
      longitude: safeLongitude,
      amenities: [...amenityIds, ...outstandingAmenityIds],
      images: photoUrls,
    }
  }, [
    title,
    description,
    basePrice,
    guests,
    beds,
    bathrooms,
    propertyTypeId,
    address,
    finalAddress,
    finalCity,
    finalRegion,
    finalCountry,
    latitude,
    longitude,
    amenityIds,
    outstandingAmenityIds,
    photoUrls,
  ])

  useEffect(() => {
    if (draftPropertyId) return
    let cancelled = false

    propertiesApi
      .createDraft()
      .then((property) => {
        if (cancelled || !property?.id) return
        setDraftPropertyId(property.id)
        localStorage.setItem(STORAGE_DRAFT_ID_KEY, property.id)
      })
      .catch(() => {
        // Si falla, el flujo continúa con borrador local y se reintenta en siguiente render.
      })

    return () => {
      cancelled = true
    }
  }, [draftPropertyId])

  useEffect(() => {
    if (!draftPropertyId || isSubmitting) return

    const payload = buildPropertyPayload()
    const timeout = window.setTimeout(() => {
      propertiesApi.saveDraft(draftPropertyId, payload).catch(() => {
        // Si falla, mantenemos localStorage como respaldo.
      })
    }, 700)

    return () => window.clearTimeout(timeout)
  }, [
    draftPropertyId,
    isSubmitting,
    buildPropertyPayload,
    propertyTypeId,
    guestAccessId,
    address,
    latitude,
    longitude,
    guests,
    beds,
    bathrooms,
    amenityIds,
    outstandingAmenityIds,
    securityElementIds,
    photoUrls,
    title,
    description,
    highlights,
    reservationPreference,
    basePrice,
    weekendPremiumPercent,
    discounts,
    hasSecurityCameraOutside,
    hasNoiseMonitor,
    hasWeapons,
    finalCountry,
    finalAddress,
    finalAddressExtra,
    finalCity,
    finalRegion,
    isBusinessHost,
  ])

  useEffect(() => {
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
      title: title.trim() || null,
      description: description.trim() || null,
      highlights,
      reservationPreference,
      basePrice,
      weekendPremiumPercent,
      discounts,
      hasSecurityCameraOutside,
      hasNoiseMonitor,
      hasWeapons,
      finalCountry,
      finalAddress,
      finalAddressExtra,
      finalCity,
      finalRegion,
      isBusinessHost,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  }, [
    propertyTypeId,
    guestAccessId,
    address,
    latitude,
    longitude,
    guests,
    beds,
    bathrooms,
    amenityIds,
    outstandingAmenityIds,
    securityElementIds,
    photoUrls.length,
    title,
    description,
    highlights,
    reservationPreference,
    basePrice,
    weekendPremiumPercent,
    discounts,
    hasSecurityCameraOutside,
    hasNoiseMonitor,
    hasWeapons,
    finalCountry,
    finalAddress,
    finalAddressExtra,
    finalCity,
    finalRegion,
    isBusinessHost,
  ])

  const canGoNext = (() => {
    if (isSubmitting) return false
    if (currentStep === 'intro') return true
    if (currentStep === 'propertyType') return Boolean(propertyTypeId)
    if (currentStep === 'guestAccess') return Boolean(guestAccessId)
    if (currentStep === 'location') return address.trim().length > 0
    if (currentStep === 'basics') return true
    if (currentStep === 'standOut') return true
    if (currentStep === 'amenities') return true
    if (currentStep === 'photos') return photoUrls.length >= 5
    if (currentStep === 'photoArrange') return photoUrls.length >= 5
    if (currentStep === 'title') return title.trim().length > 0
    if (currentStep === 'description') return description.trim().length > 0
    if (currentStep === 'highlights') return highlights.length > 0
    if (currentStep === 'finishIntro') return true
    if (currentStep === 'reservationPreferences') return reservationPreference !== null
    if (currentStep === 'basePrice') return basePrice !== null
    if (currentStep === 'weekendPrice') return weekendPremiumPercent !== null
    if (currentStep === 'discounts') return true
    if (currentStep === 'securityInfo') return true
    if (currentStep === 'finalDetails')
      return Boolean(
        finalCountry.trim() &&
          finalAddress.trim() &&
          finalCity.trim() &&
          finalRegion.trim() &&
          isBusinessHost !== null
      )
    return false
  })()

  const handleBack = () => {
    if (stepIndex === 0) {
      router.push('/host/onboarding?type=alojamiento')
      return
    }
    setStepIndex((prev) => prev - 1)
  }

  const handleNext = async () => {
    if (!canGoNext) {
      trackHostWizardEvent('host_wizard_step_blocked', {
        step: currentStep,
        stepIndex,
      })
      return
    }
    setSubmitError(null)

    if (stepIndex < STEPS.length - 1) {
      setStepIndex((prev) => prev + 1)
      return
    }

    const payload = buildPropertyPayload()

    try {
      setIsSubmitting(true)
      if (draftPropertyId) {
        await propertiesApi.saveDraft(draftPropertyId, payload)
      } else {
        const created = await propertiesApi.create(payload)
        if (created?.id) {
          localStorage.setItem(STORAGE_DRAFT_ID_KEY, created.id)
        }
      }
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_DRAFT_ID_KEY)
      trackHostWizardEvent('host_wizard_submit_success', {
        step: currentStep,
      })
      router.push('/host/listings')
    } catch (err) {
      // Si falla la creación, el borrador en localStorage permite reintentar más tarde.
      const code = parseErrorCode(err)
      const message =
        code === 'SUBSCRIPTION_INACTIVE'
          ? 'Tu suscripción está inactiva. Actívala para publicar o guardar tu alojamiento.'
          : 'No pudimos crear tu alojamiento. Verifica tu conexión o los datos e inténtalo de nuevo.'
      setSubmitError(message)
      trackHostWizardEvent('host_wizard_submit_fail', {
        step: currentStep,
        errorCode: code ?? 'UNKNOWN',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AccommodationFlowLayout
      currentStep={stepIndex}
      totalSteps={STEPS.length}
      segmentBoundaries={SEGMENT_BOUNDARIES}
      onBack={handleBack}
      onNext={handleNext}
      canGoNext={canGoNext}
      nextLabel={isSubmitting ? 'Guardando...' : 'Siguiente'}
    >
      {isSubmitting ? (
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Estamos creando tu alojamiento. Esto puede tardar unos segundos...
        </div>
      ) : null}
      {submitError ? (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}
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
      {currentStep === 'title' ? (
        <TitleStep title={title} onTitleChange={setTitle} />
      ) : null}
      {currentStep === 'description' ? (
        <DescriptionStep description={description} onDescriptionChange={setDescription} />
      ) : null}
      {currentStep === 'highlights' ? (
        <HighlightsStep selected={highlights} onChange={setHighlights} />
      ) : null}
      {currentStep === 'finishIntro' ? (
        <FinishIntroStep />
      ) : null}
      {currentStep === 'reservationPreferences' ? (
        <ReservationPreferencesStep
          value={reservationPreference}
          onChange={setReservationPreference}
        />
      ) : null}
      {currentStep === 'basePrice' ? (
        <BasePriceStep basePrice={basePrice} onBasePriceChange={setBasePrice} />
      ) : null}
      {currentStep === 'weekendPrice' ? (
        <WeekendPriceStep
          basePrice={basePrice}
          weekendPremiumPercent={weekendPremiumPercent ?? 7}
          onWeekendPremiumChange={setWeekendPremiumPercent}
        />
      ) : null}
      {currentStep === 'discounts' ? (
        <DiscountsStep selected={discounts} onChange={setDiscounts} />
      ) : null}
      {currentStep === 'securityInfo' ? (
        <SecurityInfoStep
          hasSecurityCameraOutside={hasSecurityCameraOutside}
          hasNoiseMonitor={hasNoiseMonitor}
          hasWeapons={hasWeapons}
          onChange={(field, value) => {
            if (field === 'camera') setHasSecurityCameraOutside(value)
            if (field === 'noise') setHasNoiseMonitor(value)
            if (field === 'weapons') setHasWeapons(value)
          }}
        />
      ) : null}
      {currentStep === 'finalDetails' ? (
        <FinalDetailsStep
          country={finalCountry}
          address={finalAddress}
          addressExtra={finalAddressExtra}
          city={finalCity}
          region={finalRegion}
          isBusinessHost={isBusinessHost}
          onChange={(field, value) => {
            if (field === 'country') setFinalCountry(value)
            if (field === 'address') setFinalAddress(value)
            if (field === 'addressExtra') setFinalAddressExtra(value)
            if (field === 'city') setFinalCity(value)
            if (field === 'region') setFinalRegion(value)
          }}
          onBusinessChange={setIsBusinessHost}
        />
      ) : null}
    </AccommodationFlowLayout>
  )
}
