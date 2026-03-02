 codex/implementar-arquitectura-hexagonal-y-ddd-1e30tj
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import ServiceCategoryList from '@/components/services/ServiceCategoryList'
import ServiceOffersSection from '@/components/services/ServiceOffersSection'
import ServicesSearchBar from '@/components/services/ServicesSearchBar'
import { serviceCategories, servicesSections } from '@/components/services/data'

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="h-20" />

      <section className="border-b border-[#EBEBEB] bg-[#F7F7F7] px-6 pb-12 pt-6">
        <ServicesSearchBar />
      </section>

      <section className="bg-[#F7F7F7] pb-10">
        <ServiceCategoryList title="Servicios en Bogotá" categories={serviceCategories} />

        <div className="mx-auto w-full max-w-[1600px] px-6 pb-2">
          <h2 className="text-4xl font-medium tracking-tight text-[#222222] md:text-6xl">
            Descubre los servicios disponibles en Airbnb
          </h2>
        </div>

        {servicesSections.map((section) => (
          <ServiceOffersSection key={section.id} section={section} />
        ))}
      </section>

      <Footer />
    </main>
  )

import InfoPageLayout from "@/components/support/InfoPageLayout";
import SectionCard from "@/components/support/SectionCard";

export default function ServicesPage() {
  return (
    <InfoPageLayout
      eyebrow="Servicios"
      title="Servicios premium para huéspedes y anfitriones"
      description="Estamos construyendo un catálogo de servicios para mejorar toda la experiencia: antes, durante y después de cada estancia."
    >
      <div className="grid gap-6 md:grid-cols-3">
        <SectionCard
          title="Para huéspedes"
          items={[
            "Check-in asistido y soporte de viaje.",
            "Protección en caso de incidencias elegibles.",
            "Asistencia para cambios de última hora.",
          ]}
        />
        <SectionCard
          title="Para anfitriones"
          items={[
            "Herramientas de pricing y ocupación.",
            "Automatización de mensajería y reglas de casa.",
            "Soporte para gestión de reseñas y reputación.",
          ]}
        />
        <SectionCard
          title="Para empresas"
          items={[
            "Facturación centralizada y control de viajes.",
            "Políticas corporativas de reserva y gasto.",
            "Paneles de analítica por equipo y región.",
          ]}
        />
      </div>
    </InfoPageLayout>
  );
 main
}
