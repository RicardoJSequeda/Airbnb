import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import Link from 'next/link'

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="h-20" />
      <div className="max-w-[720px] mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-secondary mb-4">Centro de ayuda</h1>
        <p className="text-secondary mb-6">Contenido en preparacion.</p>
        <Link href="/" className="text-primary font-medium hover:underline">Volver al inicio</Link>
      </div>
      <Footer />
    </main>
  )
}
