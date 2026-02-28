import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import Link from 'next/link'

export default function HostServicioPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="h-20" />
      <div className="max-w-[720px] mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-secondary mb-4">Publicar servicio</h1>
        <p className="text-secondary leading-relaxed mb-6">
          Esta sección estará disponible pronto con el proceso completo para publicar tu servicio.
        </p>
        <Link href="/host" className="text-primary font-medium hover:underline">
          Volver
        </Link>
      </div>
      <Footer />
    </main>
  )
}
