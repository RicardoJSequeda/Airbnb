import ServiceOfferCard from './ServiceOfferCard'
import type { ServiceSectionData } from './types'

interface ServiceOffersSectionProps {
  section: ServiceSectionData
}

export default function ServiceOffersSection({ section }: ServiceOffersSectionProps) {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-6 py-6">
      <h2 className="mb-5 text-5xl font-medium tracking-tight text-[#222222]">{section.title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {section.offers.map((offer) => (
          <ServiceOfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </section>
  )
}
