'use client'

import Image from 'next/image'

export interface ExperienceStep {
  title: string
  description: string
  imageUrl?: string
}

interface ExperienceWhatYouWillDoProps {
  steps: ExperienceStep[]
  fallbackImage?: string
}

export default function ExperienceWhatYouWillDo({
  steps,
  fallbackImage,
}: ExperienceWhatYouWillDoProps) {
  if (steps.length === 0) return null

  return (
    <section className="border-t border-neutral-200 pt-8 space-y-4">
      <h2 className="text-xl font-semibold text-neutral-900">Qué harás</h2>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex gap-5">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gray-200">
              {(step.imageUrl || fallbackImage) ? (
                <Image
                  src={step.imageUrl || fallbackImage!}
                  alt={step.title}
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-semibold">
                  {index + 1}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-neutral-900">{step.title}</h3>
              <p className="mt-1 text-sm text-neutral-600 leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
