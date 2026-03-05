'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AccommodationFlowLayout } from '@/components/host-accommodation/AccommodationFlowLayout'
import { GuestAccessStep } from '@/components/host-accommodation/GuestAccessStep'
import { IntroStep } from '@/components/host-accommodation/IntroStep'
import { PropertyTypeStep } from '@/components/host-accommodation/PropertyTypeStep'
import type { AccommodationDraft, AccommodationStepKey } from '@/components/host-accommodation/types'

const STEPS: AccommodationStepKey[] = ['intro', 'propertyType', 'guestAccess']
const STORAGE_KEY = 'host-draft-accommodation'

function getInitialDraft(): AccommodationDraft {
  if (typeof window === 'undefined') {
    return { propertyTypeId: null, guestAccessId: null }
  }

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return { propertyTypeId: null, guestAccessId: null }
  }

  try {
    const parsed = JSON.parse(raw) as AccommodationDraft
    return {
      propertyTypeId: parsed.propertyTypeId ?? null,
      guestAccessId: parsed.guestAccessId ?? null,
    }
  } catch {
    return { propertyTypeId: null, guestAccessId: null }
  }
}

export default function HostAlojamientoPage() {
  const router = useRouter()
  const initialDraft = getInitialDraft()
  const [stepIndex, setStepIndex] = useState(0)
  const [propertyTypeId, setPropertyTypeId] = useState<string | null>(initialDraft.propertyTypeId)
  const [guestAccessId, setGuestAccessId] = useState<string | null>(initialDraft.guestAccessId)

  const currentStep = STEPS[stepIndex]

  const canGoNext = useMemo(() => {
    if (currentStep === 'intro') return true
    if (currentStep === 'propertyType') return Boolean(propertyTypeId)
    if (currentStep === 'guestAccess') return Boolean(guestAccessId)
    return false
  }, [currentStep, propertyTypeId, guestAccessId])

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
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    router.push('/host')
  }

  return (
    <AccommodationFlowLayout
      currentStep={stepIndex}
      totalSteps={STEPS.length}
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
    </AccommodationFlowLayout>
  )
}
