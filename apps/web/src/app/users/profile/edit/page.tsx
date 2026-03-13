'use client'

import { DetailedProfileView, useProfileUser } from '@/components/profile'

export default function ProfileEditPage() {
  const user = useProfileUser()

  if (!user) return null

  return (
    <DetailedProfileView user={user} />
  )
}
