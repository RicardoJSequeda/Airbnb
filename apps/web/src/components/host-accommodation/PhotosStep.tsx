'use client'

import { useState } from 'react'
import { Camera } from 'lucide-react'
import { UploadPhotosModal } from './UploadPhotosModal'

const MIN_PHOTOS = 5

interface PhotosStepProps {
  photoUrls: string[]
  onPhotosChange: (urls: string[]) => void
}

export function PhotosStep({ photoUrls, onPhotosChange }: PhotosStepProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const handleUpload = (newUrls: string[]) => {
    onPhotosChange([...photoUrls, ...newUrls])
  }

  const removePhoto = (index: number) => {
    onPhotosChange(photoUrls.filter((_, i) => i !== index))
  }

  return (
    <>
      <section className="max-w-[640px] mx-auto px-4 sm:px-6 py-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-[#222222] mb-2">
          Agrega algunas fotos de tu casa
        </h2>
        <p className="text-sm text-[#717171] mb-6">
          Para empezar, necesitarás cinco fotos. Después podrás agregar más o hacer cambios.
        </p>

        <div className="border-2 border-dashed border-[#DDDDDD] rounded-xl bg-[#F7F7F7] min-h-[280px] flex flex-col items-center justify-center p-8">
          <Camera className="w-16 h-16 text-[#717171] mb-4 flex-shrink-0" strokeWidth={1.5} />
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 rounded-lg border-2 border-[#222222] bg-white text-[#222222] font-medium text-sm hover:bg-gray-50 transition"
          >
            Agrega fotos
          </button>
          {photoUrls.length > 0 && (
            <p className="mt-3 text-sm text-[#717171]">
              {photoUrls.length} foto{photoUrls.length !== 1 ? 's' : ''} agregada
              {photoUrls.length !== 1 ? 's' : ''}
              {photoUrls.length < MIN_PHOTOS && ` (mínimo ${MIN_PHOTOS})`}
            </p>
          )}
        </div>

        {photoUrls.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {photoUrls.map((url, index) => (
              <div
                key={index}
                className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[#DDDDDD]"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-black/80"
                  aria-label="Quitar foto"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <UploadPhotosModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpload={handleUpload}
      />
    </>
  )
}
