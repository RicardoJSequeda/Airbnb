'use client'

import { useState, useEffect } from 'react'
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
import type { Review } from '@/types'

const schema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface EditReviewModalProps {
  open: boolean
  onClose: () => void
  review: Review | null
  onSuccess?: () => void
}

export default function EditReviewModal({
  open,
  onClose,
  review,
  onSuccess,
}: EditReviewModalProps) {
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0, comment: '' },
  })

  useEffect(() => {
    if (review) {
      form.reset({
        rating: review.rating,
        comment: review.comment ?? '',
      })
    }
  }, [review, form])

  const handleSubmit = async (data: FormData) => {
    if (!review) return
    setSubmitting(true)
    try {
      await reviewsApi.update(review.id, {
        rating: data.rating,
        comment: data.comment,
      })
      toast.success('Reseña actualizada')
      onClose()
      onSuccess?.()
    } catch (err) {
      toast.error(parseErrorMessage(err, 'Error al actualizar'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SimpleModal open={open} onClose={onClose} title="Editar reseña">
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
                  <FormLabel>Comentario</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      placeholder="Tu comentario..."
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
                {submitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </Form>
    </SimpleModal>
  )
}
