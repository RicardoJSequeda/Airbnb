'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Star } from 'lucide-react'
import { SimpleModal } from '@/components/ui/simple-modal'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { reviewsApi } from '@/lib/api/reviews'
import { parseErrorMessage } from '@/lib/utils/parse-error'
import { toast } from 'sonner'

const schema = z.object({
  rating: z.number().min(1, 'Selecciona una puntuación').max(5),
  comment: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface CreateReviewModalProps {
  open: boolean
  onClose: () => void
  bookingId: string
  propertyTitle?: string
  onSuccess?: () => void
}

export default function CreateReviewModal({
  open,
  onClose,
  bookingId,
  propertyTitle,
  onSuccess,
}: CreateReviewModalProps) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  })

  const handleSubmit = async (data: FormData) => {
    setSubmitting(true)
    try {
      await reviewsApi.create({
        bookingId,
        rating: data.rating,
        comment: data.comment,
      })
      toast.success('Reseña publicada correctamente')
      form.reset({ rating: 0, comment: '' })
      onClose()
      onSuccess?.()
    } catch (err) {
      toast.error(parseErrorMessage(err, 'Error al publicar la reseña'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SimpleModal open={open} onClose={onClose} title="Dejar reseña">
      {propertyTitle && (
        <p className="text-sm text-secondary mb-4">{propertyTitle}</p>
      )}
      <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Puntuación</FormLabel>
                  <FormControl>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          className="p-1 transition-transform hover:scale-110"
                          aria-label={`${star} estrellas`}
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= (field.value || 0)
                                ? 'fill-primary text-primary'
                                : 'fill-gray-200 text-gray-200'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentario (opcional)</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="Cuéntanos tu experiencia..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Publicando...' : 'Publicar reseña'}
              </Button>
            </div>
          </form>
        </Form>
    </SimpleModal>
  )
}
