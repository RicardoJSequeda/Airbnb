'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useAuthStore } from '@/lib/stores/auth-store'

export interface ProfileNavItem {
  label: string
  href: string
  iconType: 'avatar' | 'maleta' | 'familia'
}

const defaultNavItems: ProfileNavItem[] = [
  { label: 'Información sobre mí', href: '/users/profile/about', iconType: 'avatar' },
  { label: 'Viajes anteriores', href: '/users/profile/trips', iconType: 'maleta' },
  { label: 'Conexiones', href: '/users/profile/connections', iconType: 'familia' },
]

export interface ProfileSidebarProps {
  title?: string
  items?: ProfileNavItem[]
}

export function ProfileSidebar({ title = 'Perfil', items = defaultNavItems }: ProfileSidebarProps) {
  const pathname = usePathname()
  const user = useAuthStore(s => s.user)

  return (
    <aside className="w-full lg:w-[240px] flex-shrink-0 pr-4">
      <h1 className="text-3xl font-bold text-neutral-900 mb-6">{title}</h1>
      <nav className="flex flex-col gap-0.5 mt-2">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === '/users/profile/about' && pathname === '/users/profile') ||
            (item.href !== '/users/profile/about' && pathname?.startsWith(item.href))
            
          let iconContent = null
          if (item.iconType === 'avatar') {
            const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
            iconContent = user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-[32px] h-[32px] rounded-full object-cover" />
            ) : (
              <div className="w-[32px] h-[32px] rounded-full bg-neutral-900 text-white flex items-center justify-center text-[14px] font-semibold">
                {initial}
              </div>
            )
          } else if (item.iconType === 'maleta') {
             iconContent = <Image src="/icons/maleta.avif" alt="Maleta" width={32} height={32} className="object-contain" />
          } else if (item.iconType === 'familia') {
             iconContent = <Image src="/icons/familia.avif" alt="Familia" width={32} height={32} className="object-contain" />
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-[15px] font-medium transition-colors duration-150 ${
                isActive
                  ? 'bg-neutral-100/80 text-neutral-900'
                  : 'text-neutral-700 hover:bg-neutral-100/50'
              }`}
            >
              <div className="flex items-center justify-center w-[32px] h-[32px] flex-shrink-0">
                {iconContent}
              </div>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
