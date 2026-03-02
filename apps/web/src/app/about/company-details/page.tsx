import InfoPageLayout from "@/components/support/InfoPageLayout";
import SectionCard from "@/components/support/SectionCard";

export default function CompanyDetailsPage() {
  return (
    <InfoPageLayout
      eyebrow="Empresa"
      title="Datos de la empresa"
      description="Información corporativa y de cumplimiento para usuarios, anfitriones y aliados comerciales."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard
          title="Identificación"
          items={[
            "Razón social: Airbnb Clone Platform S.A.S.",
            "NIT: 901.000.000-1 (referencial para entorno demo).",
            "Domicilio principal: Bogotá, Colombia.",
          ]}
        />
        <SectionCard
          title="Cumplimiento"
          items={[
            "Programa interno de protección al consumidor.",
            "Canales de reporte para fraude y seguridad.",
            "Políticas de protección de datos personales vigentes.",
          ]}
        />
      </div>

      <SectionCard
        title="Atención legal y regulatoria"
        items={[
          "Correo: legal@airbnb-clone.example",
          "Horario de atención: lunes a viernes, 8:00 a.m. – 6:00 p.m. (COT).",
          "Tiempo de respuesta objetivo: 2 a 5 días hábiles.",
        ]}
      />
    </InfoPageLayout>
  );
}
