interface SectionCardProps {
  title: string;
  items: string[];
}

export default function SectionCard({ title, items }: SectionCardProps) {
  return (
    <article className="rounded-2xl border border-[#EBEBEB] p-6">
      <h2 className="mb-4 text-xl font-semibold text-[#222222]">{title}</h2>
      <ul className="space-y-3 text-[#484848]">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2 text-sm leading-relaxed md:text-base"
          >
            <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#717171]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
