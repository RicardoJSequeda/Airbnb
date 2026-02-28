'use client'

import { useEffect, useState } from 'react'
import { publicExperiencesApi } from '@/lib/api/experiences'
import { parseErrorMessage } from '@/lib/utils/parse-error'
import type { Experience } from '@/types/experience'

interface UseExperienceDetailResult {
  experience: Experience | null
  loading: boolean
  error: string | null
}

/**
 * Capa de aplicación para cargar el detalle de una experiencia.
 * La UI no debería llamar a lib/api directamente.
 */
export function useExperienceDetail(id: string | null | undefined): UseExperienceDetailResult {
  const [experience, setExperience] = useState<Experience | null>(null)
  const [loading, setLoading] = useState<boolean>(Boolean(id))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    publicExperiencesApi
      .getById(id)
      .then(setExperience)
      .catch((err) => setError(parseErrorMessage(err, 'Error al cargar la experiencia')))
      .finally(() => setLoading(false))
  }, [id])

  return { experience, loading, error }
}

