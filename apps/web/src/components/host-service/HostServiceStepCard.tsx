interface HostServiceStepCardProps {
  step: number
  title: string
  description: string
}

export default function HostServiceStepCard({ step, title, description }: HostServiceStepCardProps) {
  return (
    <article className="rounded-2xl border border-[#EBEBEB] bg-white p-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">Paso {step}</p>
      <h3 className="mb-2 text-lg font-semibold text-[#222222]">{title}</h3>
      <p className="text-sm leading-relaxed text-[#6A6A6A]">{description}</p>
    </article>
  )
}
