'use client'

import { useCallback, useRef, useState } from 'react'
import { Images, Plus, X } from 'lucide-react'

const MAX_PENDING = 20

function filesToDataUrls(files: File[]): Promise<string[]> {
  const imageFiles = files.filter((f) => f.type.startsWith('image/'))
  if (!imageFiles.length) return Promise.resolve([])
  return new Promise((resolve) => {
    const urls: string[] = []
    let done = 0
    imageFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') urls.push(reader.result)
        done++
        if (done === imageFiles.length) resolve(urls)
      }
      reader.readAsDataURL(file)
    })
  })
}

interface UploadPhotosModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (urls: string[]) => void
}

export function UploadPhotosModal({ isOpen, onClose, onUpload }: UploadPhotosModalProps) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const list = Array.isArray(newFiles) ? newFiles : Array.from(newFiles)
    const images = list.filter((f) => f.type.startsWith('image/'))
    setPendingFiles((prev) => [...prev, ...images].slice(0, MAX_PENDING))
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files?.length) addFiles(files)
    e.target.value = ''
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
    },
    [addFiles]
  )

  const handleUpload = async () => {
    if (!pendingFiles.length) return
    setIsUploading(true)
    const urls = await filesToDataUrls(pendingFiles)
    onUpload(urls)
    setPendingFiles([])
    setIsUploading(false)
    onClose()
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleClose = () => {
    setPendingFiles([])
    if (inputRef.current) inputRef.current.value = ''
    onClose()
  }

  const canUpload = pendingFiles.length > 0 && !isUploading

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#DDDDDD]">
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-[#222222] hover:bg-gray-100 rounded-full"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1 text-center">
            <h3 className="text-lg font-semibold text-[#222222]">Sube fotos</h3>
            <p className="text-sm text-[#717171] mt-0.5">
              {pendingFiles.length === 0
                ? 'No seleccionaste ningún elemento.'
                : `${pendingFiles.length} elemento${pendingFiles.length !== 1 ? 's' : ''} seleccionado${pendingFiles.length !== 1 ? 's' : ''}.`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="p-1.5 text-[#222222] hover:bg-gray-100 rounded-full"
            aria-label="Añadir más"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div
          className={`flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl mx-4 mt-4 mb-2 min-h-[220px] transition-colors ${
            isDragging ? 'border-[#222222] bg-gray-50' : 'border-[#DDDDDD] bg-[#FAFAFA]'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            setIsDragging(false)
          }}
        >
          <Images className="w-14 h-14 text-[#717171] mb-3 flex-shrink-0" strokeWidth={1.5} />
          <p className="text-base font-semibold text-[#222222] mb-1">Arrastra y suelta</p>
          <p className="text-sm text-[#717171] mb-4">o busca fotos</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="px-5 py-2.5 rounded-lg bg-[#222222] text-white font-medium text-sm hover:bg-[#333333] transition"
          >
            Navegar
          </button>
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-[#DDDDDD]">
          <span className="text-sm font-medium text-[#222222]">Listo</span>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!canUpload}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition ${
              canUpload ? 'bg-[#222222] text-white hover:bg-[#333333]' : 'bg-[#E7E7E7] text-[#B0B0B0] cursor-not-allowed'
            }`}
          >
            Sube
          </button>
        </div>
      </div>
    </div>
  )
}
