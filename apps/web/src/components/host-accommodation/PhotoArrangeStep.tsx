'use client'

import { useCallback, useState } from 'react'
import { ImagePlus, MoreHorizontal, Plus } from 'lucide-react'
import { UploadPhotosModal } from './UploadPhotosModal'

const MIN_PHOTOS = 5

interface PhotoArrangeStepProps {
  photoUrls: string[]
  onPhotosChange: (urls: string[]) => void
}

export function PhotoArrangeStep({ photoUrls, onPhotosChange }: PhotoArrangeStepProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState<number | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleAddPhotos = useCallback(
    (newUrls: string[]) => {
      onPhotosChange([...photoUrls, ...newUrls])
    },
    [photoUrls, onPhotosChange]
  )

  const movePhoto = (from: number, to: number) => {
    if (from === to) return
    const arr = [...photoUrls]
    const [removed] = arr.splice(from, 1)
    arr.splice(to, 0, removed)
    onPhotosChange(arr)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.setData('text/plain', String(index))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (!isNaN(fromIndex) && fromIndex !== toIndex) movePhoto(fromIndex, toIndex)
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const removePhoto = (index: number) => {
    onPhotosChange(photoUrls.filter((_, i) => i !== index))
    setMenuOpen(null)
  }

  const coverUrl = photoUrls[0]
  const gridUrls = photoUrls.slice(1, 5)

  return (
    <>
      <section className="max-w-[720px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#222222]">
              Elige por los menos 5 fotos
            </h2>
            <p className="text-sm text-[#717171] mt-1">
              Arrastra la foto para cambiarla de lugar
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="w-10 h-10 rounded-full border-2 border-[#222222] flex items-center justify-center text-[#222222] hover:bg-gray-50 shrink-0"
            aria-label="Agregar fotos"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Foto de portada */}
        {coverUrl ? (
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, 0)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 0)}
            onDragEnd={handleDragEnd}
            className={`relative aspect-[16/10] rounded-xl overflow-hidden border border-[#DDDDDD] mb-4 cursor-grab active:cursor-grabbing ${draggedIndex === 0 ? 'opacity-50' : ''}`}
          >
            <img src={coverUrl} alt="Portada" className="w-full h-full object-cover pointer-events-none" />
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-white/90 text-xs font-medium text-[#222222]">
              Foto de portada
            </span>
            <div className="absolute top-3 right-3">
              <button
                type="button"
                onClick={() => setMenuOpen(menuOpen === 0 ? null : 0)}
                className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-[#222222] hover:bg-white"
                aria-label="Opciones"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {menuOpen === 0 && (
                <div className="absolute right-0 top-full mt-1 py-1 bg-white rounded-lg shadow-lg border border-[#DDDDDD] min-w-[140px]">
                  <button
                    type="button"
                    onClick={() => removePhoto(0)}
                    className="w-full px-4 py-2 text-left text-sm text-[#222222] hover:bg-gray-100"
                  >
                    Eliminar foto
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="aspect-[16/10] rounded-xl border-2 border-dashed border-[#DDDDDD] bg-[#F7F7F7] flex items-center justify-center mb-4">
            <div className="text-center">
              <ImagePlus className="w-12 h-12 text-[#B0B0B0] mx-auto mb-2" />
              <p className="text-sm text-[#717171]">Agrega una foto de portada</p>
            </div>
          </div>
        )}

        {/* Grid de fotos */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {gridUrls.map((url, i) => {
            const idx = i + 1
            return (
            <div
              key={idx}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={`relative aspect-[4/3] rounded-lg overflow-hidden border border-[#DDDDDD] cursor-grab active:cursor-grabbing ${
                draggedIndex === idx ? 'opacity-50' : ''
              }`}
            >
              <img src={url} alt="" className="w-full h-full object-cover pointer-events-none" />
              <button
                type="button"
                onClick={() => setMenuOpen(menuOpen === idx ? null : idx)}
                className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                aria-label="Opciones"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {menuOpen === idx && (
                <div className="absolute right-1 top-8 py-1 bg-white rounded-lg shadow-lg border border-[#DDDDDD] min-w-[140px] z-10">
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="w-full px-4 py-2 text-left text-sm text-[#222222] hover:bg-gray-100"
                  >
                    Eliminar foto
                  </button>
                </div>
              )}
            </div>
          )
          })}
          {/* Slot Agrega más */}
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="aspect-[4/3] rounded-lg border-2 border-dashed border-[#DDDDDD] bg-[#F7F7F7] flex flex-col items-center justify-center gap-2 hover:border-[#B0B0B0] hover:bg-gray-50 transition"
          >
            <Plus className="w-10 h-10 text-[#717171]" strokeWidth={1.5} />
            <span className="text-sm font-medium text-[#222222]">Agrega más</span>
          </button>
        </div>

        {photoUrls.length > 0 && (
          <p className="mt-3 text-sm text-[#717171]">
            {photoUrls.length} foto{photoUrls.length !== 1 ? 's' : ''}
            {photoUrls.length < MIN_PHOTOS && ` (mínimo ${MIN_PHOTOS})`}
          </p>
        )}
      </section>

      <UploadPhotosModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpload={handleAddPhotos}
      />
    </>
  )
}
