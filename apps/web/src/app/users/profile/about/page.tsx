'use client'

import Link from 'next/link'
import { UserInfoCard, CompleteProfilePrompt, UserReviewsLink, useProfileUser } from '@/components/profile'

export default function ProfileAboutPage() {
  const user = useProfileUser()

  if (!user) return null

  return (
    <>
      {/* Header: título y botón Editar al lado con diseño de botón */}
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl font-semibold text-neutral-900 tracking-tight">
          Información sobre mí
        </h1>
        <Link
          href="/users/profile/edit"
          prefetch
          className="rounded-lg bg-neutral-100 px-4 py-2 text-sm font-normal text-neutral-900 hover:bg-neutral-200 transition-colors duration-150"
        >
          Editar
        </Link>
      </div>

      {/* Contenido principal: space-y-10, sin centrado, items-start */}
      <div className="space-y-10">
        {/* Fila superior: flex gap-6 items-start */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <UserInfoCard user={user} className="w-full md:w-[320px] flex-shrink-0" />
          <CompleteProfilePrompt className="flex-1 min-w-0 w-full" />
        </div>

        {/* Reseñas */}
        <UserReviewsLink href="/my-reviews" />
      </div>
    </>
  )
}
