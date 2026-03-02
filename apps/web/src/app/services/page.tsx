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
}
