'use client'

import { useEffect, useState } from 'react'
import { publicExperiencesApi } from '@/lib/api/experiences'
import { parseErrorMessage } from '@/lib/utils/parse-error'
import type { Experience } from '@/types/experience'

interface ExperiencesFilters {
  city?: string
  country?: string
  category?: string
  minParticipants?: number
  /** 'service' = solo categorías servicio (tasting, adventure, workshop); 'experience' = solo el resto */
  listingType?: 'service' | 'experience'
}

interface UseExperiencesListResult {
  experiences: Experience[]
  loading: boolean
  error: string | null
}

/**
 * Capa de aplicación: listado de experiencias públicas.
 * La UI no debe llamar directamente a publicExperiencesApi.getAll.
 */
export function useExperiencesList(filters: ExperiencesFilters): UseExperiencesListResult {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { city, country, category, minParticipants, listingType } = filters

  useEffect(() => {
    setLoading(true)
    setError(null)
    publicExperiencesApi
      .getAll({
        city,
        country,
        category,
        minParticipants,
        listingType,
      })
      .then(setExperiences)
      .catch((err) => setError(parseErrorMessage(err, 'Error al cargar experiencias')))
      .finally(() => setLoading(false))
  }, [city, country, category, minParticipants, listingType])

  return { experiences, loading, error }
}

