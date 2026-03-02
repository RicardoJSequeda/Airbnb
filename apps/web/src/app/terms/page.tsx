import InfoPageLayout from "@/components/support/InfoPageLayout";
import SectionCard from "@/components/support/SectionCard";

export default function TermsPage() {
  return (
    <InfoPageLayout
      eyebrow="Legal"
      title="Condiciones de uso"
      description="Estas condiciones explican cómo usar la plataforma, qué responsabilidades asume cada parte y cómo protegemos la confianza entre huéspedes y anfitriones."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard
          title="Uso de la plataforma"
          items={[
            "Debes proporcionar información veraz y mantener tu cuenta segura.",
            "No está permitido usar la plataforma para actividades ilegales o fraudulentas.",
            "Podemos limitar funciones ante incumplimientos de seguridad.",
          ]}
        />
        <SectionCard
          title="Reservas y cancelaciones"
          items={[
            "Cada anuncio define políticas específicas de cancelación.",
            "El pago y el estado de la reserva se rigen por las reglas publicadas al confirmar.",
            "Los reembolsos se gestionan según elegibilidad y método de pago.",
          ]}
        />
      </div>

      <SectionCard
        title="Comunidad y confianza"
        items={[
          "Esperamos trato respetuoso entre personas usuarias.",
          "Podemos actuar sobre reseñas, contenido o mensajes que infrinjan normas.",
          "Investigamos reportes de seguridad y tomamos medidas preventivas.",
        ]}
      />
    </InfoPageLayout>
  );
}
