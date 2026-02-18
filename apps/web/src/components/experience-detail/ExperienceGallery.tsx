'use client'

import Image from 'next/image'

interface ExperienceGalleryProps {
  images: string[]
  title: string
}

export default function ExperienceGallery({ images, title }: ExperienceGalleryProps) {
  const [img0, img1, img2, img3] = images.length >= 4
    ? [images[0], images[1], images[2], images[3]]
    : [
        images[0] ?? '',
        images[1] ?? images[0] ?? '',
        images[2] ?? images[0] ?? '',
        images[3] ?? images[1] ?? images[0] ?? '',
      ]

  if (images.length === 0) {
    return (
      <div className="aspect-[16/10] rounded-t-xl bg-gray-200 flex items-center justify-center text-gray-500">
        Sin imagenes
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-0 rounded-t-xl overflow-hidden aspect-[16/10] max-h-[480px]">
      <div className="relative col-span-1 row-span-1 min-h-0">
        <Image src={img0} alt={title} fill className="object-cover" sizes="50vw" priority />
      </div>
      <div className="relative col-span-1 row-span-1 min-h-0">
        <Image src={img1} alt={title} fill className="object-cover" sizes="50vw" />
      </div>
      <div className="relative col-span-1 row-span-1 min-h-0">
        <Image src={img2} alt={title} fill className="object-cover" sizes="50vw" />
      </div>
      <div className="relative col-span-1 row-span-1 min-h-0">
        <Image src={img3} alt={title} fill className="object-cover" sizes="50vw" />
      </div>
    </div>
  )
}
