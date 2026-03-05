'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Briefcase, Users } from 'lucide-react'

export interface ProfileNavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string; size?: number }>
}

const defaultNavItems: ProfileNavItem[] = [
  { label: 'Información sobre mí', href: '/users/profile/about', icon: User },
  { label: 'Viajes anteriores', href: '/users/profile/trips', icon: Briefcase },
  { label: 'Conexiones', href: '/users/profile/connections', icon: Users },
]

export interface ProfileSidebarProps {
  title?: string
  items?: ProfileNavItem[]
}

export function ProfileSidebar({ title = 'Perfil', items = defaultNavItems }: ProfileSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-full lg:w-[240px] flex-shrink-0 pr-4">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">{title}</h1>
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/users/profile/about' && pathname === '/users/profile') ||
            (item.href !== '/users/profile/about' && pathname?.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-neutral-700 transition-colors duration-150 ${
                isActive
                  ? 'bg-neutral-100 text-neutral-900'
                  : 'hover:bg-neutral-100'
              }`}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0 text-neutral-600" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
