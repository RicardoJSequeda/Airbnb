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
}
