import InfoPageLayout from "@/components/support/InfoPageLayout";
import SectionCard from "@/components/support/SectionCard";

export default function HelpPage() {
  return (
    <InfoPageLayout
      eyebrow="Soporte"
      title="Centro de ayuda"
      description="Resuelve dudas sobre reservas, pagos, cancelaciones y seguridad. Diseñamos esta experiencia para que encuentres respuestas rápidas, con el estilo claro y directo de Airbnb."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard
          title="Reservas"
          items={[
            "Cómo reservar un alojamiento o experiencia de forma segura.",
            "Qué hacer si el anfitrión no responde a tiempo.",
            "Cómo modificar fechas y número de huéspedes.",
          ]}
        />
        <SectionCard
          title="Pagos y reembolsos"
          items={[
            "Métodos de pago admitidos y validaciones del sistema.",
            "Tiempos de procesamiento de reembolsos por banco/país.",
            "Recibos, comprobantes y seguimiento del estado de pago.",
          ]}
        />
      </div>

      <SectionCard
        title="Contacto y respuesta prioritaria"
        items={[
          "Soporte 24/7 para incidentes de viaje activos.",
          "Canales de atención para cuentas, seguridad y disputas.",
          "Escalamiento interno cuando existe riesgo para huéspedes o anfitriones.",
        ]}
      />
    </InfoPageLayout>
  );
}
