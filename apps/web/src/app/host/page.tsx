'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import Link from 'next/link'
import { ShareHostModal } from '@/components/shared/ShareHostModal'

export default function HostPage() {
  const [modalOpen, setModalOpen] = useState(true)

  useEffect(() => {
    setModalOpen(true)
  }, [])

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="h-20" />
      {!modalOpen && (
        <div className="max-w-[720px] mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-semibold text-secondary mb-4">Conviértete en anfitrión</h1>
          <p className="text-secondary leading-relaxed mb-6">
            Elige qué te gustaría compartir para comenzar.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-block px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Elegir qué compartir
          </button>
          <p className="mt-6">
            <Link href="/" className="text-primary font-medium hover:underline">
              Volver al inicio
            </Link>
          </p>
        </div>
      )}
      <Footer />

      <ShareHostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </main>
  )
}
