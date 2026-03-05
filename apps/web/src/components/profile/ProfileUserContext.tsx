'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { User } from '@/types'

const ProfileUserContext = createContext<User | null>(null)

export function ProfileUserProvider({
  user,
  children,
}: {
  user: User | null
  children: ReactNode
}) {
  return (
    <ProfileUserContext.Provider value={user}>
      {children}
    </ProfileUserContext.Provider>
  )
}

export function useProfileUser(): User | null {
  return useContext(ProfileUserContext)
}
