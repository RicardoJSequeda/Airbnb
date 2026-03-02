import type { ServiceCategory } from './types'

interface ServiceCategoryListProps {
  title: string
  categories: ServiceCategory[]
}

export default function ServiceCategoryList({ title, categories }: ServiceCategoryListProps) {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-6 py-10">
      <h2 className="mb-6 text-5xl font-medium tracking-tight text-[#222222]">{title}</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {categories.map((category) => (
          <article key={category.id} className="w-[220px] shrink-0">
            <img
              src={category.imageUrl}
              alt={category.name}
              className="h-[220px] w-full rounded-[24px] object-cover"
            />
            <h3 className="mt-3 text-xl font-medium text-[#222222]">{category.name}</h3>
            <p className="text-base text-[#6A6A6A]">{category.availability}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
