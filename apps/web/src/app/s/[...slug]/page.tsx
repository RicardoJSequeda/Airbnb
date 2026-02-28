'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string[]
  const cityPart = Array.isArray(slug) && slug.length > 0 ? slug[0] : ''
  const city = cityPart
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' ')

  useEffect(() => {
    const search = new URLSearchParams()
    if (city) search.set('city', city)
    router.replace(`/search?${search.toString()}`)
  }, [city, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-secondary">Redirigiendo...</p>
    </div>
  )
}
