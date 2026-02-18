'use client'

import Image from 'next/image'

interface ExperienceHostCardProps {
  hostName: string
  hostAvatar?: string | null
  hostDescription: string
}

export default function ExperienceHostCard(props: ExperienceHostCardProps) {
  const { hostName, hostAvatar, hostDescription } = props
  const first = hostName.split(' ')[0]
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {hostAvatar ? (
            <Image src={hostAvatar} alt={hostName} fill className="object-cover" sizes="80px" />
          ) : (
            <span className="flex items-center justify-center w-full h-full text-2xl font-semibold text-secondary">
              {hostName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <p className="mt-3 font-semibold text-secondary">{hostName}</p>
        <p className="mt-1 text-sm text-text-2">{hostDescription}</p>
        <button
          type="button"
          className="mt-4 w-full max-w-[280px] py-3 px-4 rounded-lg border border-gray-300 font-medium text-secondary hover:bg-gray-50 transition-colors"
        >
          Mensajea a {first}
        </button>
      </div>
    </div>
  )
}
