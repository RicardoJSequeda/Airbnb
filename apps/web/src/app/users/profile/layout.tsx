'use client'

import { useEffect } from 'react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { ProfileSidebar, ProfileUserProvider } from '@/components/profile'
import { useAuthStore } from '@/lib/stores/auth-store'
import { useLoginModalStore } from '@/lib/stores/login-modal-store'
import { usePathname } from 'next/navigation'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const openLoginModal = useLoginModalStore((s) => s.open)

  useEffect(() => {
    if (!isAuthenticated) openLoginModal(pathname ?? '/users/profile')
  }, [isAuthenticated, openLoginModal, pathname])

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] pt-24">
          <p className="text-neutral-500 pt-10 px-6">Cargando...</p>
        </main>
        <Footer />
      </>
    )
  }

  const isEditPage = pathname === '/users/profile/edit'

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-24 pb-16">
        <div className={`mx-auto px-6 md:px-10 lg:px-12 mt-10 transition-all duration-300 ${isEditPage ? 'max-w-[1030px]' : 'max-w-[1120px]'}`}>
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start overflow-visible">
            {!isEditPage && <ProfileSidebar />}
            <div className={`flex-1 min-w-0 w-full lg:w-auto ${!isEditPage ? 'border-l border-neutral-200 pl-14 lg:pl-20 -mt-14 pt-14 lg:-mt-14 lg:pt-14' : ''}`}>
              <div
                key={pathname}
                className="max-w-[100%] opacity-0 profile-panel-transition transition-opacity duration-150 ease-in-out"
              >
                <ProfileUserProvider user={user}>
                  {children}
                </ProfileUserProvider>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
