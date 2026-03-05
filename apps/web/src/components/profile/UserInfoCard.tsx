'use client'

import { User } from '@/types'

export interface UserInfoCardProps {
  user: Pick<User, 'name' | 'avatar' | 'role'>
  roleLabel?: string
  className?: string
}

const roleLabels: Record<string, string> = {
  GUEST: 'Huésped',
  HOST: 'Anfitrión',
  ADMIN: 'Administrador',
}

function capitalizeFirst(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function UserInfoCard({ user, roleLabel, className = '' }: UserInfoCardProps) {
  const displayRole = roleLabel ?? roleLabels[user.role] ?? 'Huésped'
  const displayName = user.name ? capitalizeFirst(user.name) : 'Usuario'

  return (
    <div
      className={`w-[320px] bg-white rounded-2xl border border-neutral-200 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-8 flex flex-col items-center text-center ${className}`}
    >
      <div className="w-28 h-28 rounded-full overflow-hidden flex-shrink-0 mb-5">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
            <span className="text-3xl font-semibold text-neutral-500">
              {user.name?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
        )}
      </div>
      <h2 className="text-2xl font-semibold text-neutral-900 text-center leading-snug">{displayName}</h2>
      <p className="text-sm text-neutral-500 text-center mt-0">{displayRole}</p>
    </div>
  )
}
