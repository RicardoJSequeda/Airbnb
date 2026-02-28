'use client'

import { Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ChevronLeft, CreditCard } from 'lucide-react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { publicExperiencesApi } from '@/lib/api/experiences'
import { parseErrorMessage } from '@/lib/utils/parse-error'
import type { Experience } from '@/types/experience'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

const TIME_SLOTS_DAY = [
  { start: 10, startMin: 0, end: 12, endMin: 15 },
  { start: 17, startMin: 0, end: 19, endMin: 15 },
]

function buildMockSlots(count: number): { id: string; dateLabel: string; timeRange: string; displayDate: string; timeRangeCompact: string }[] {
  const slots: { id: string; dateLabel: string; timeRange: string; displayDate: string; timeRangeCompact: string }[] = []
  const pad = (n: number) => n.toString().padStart(2, '0')
  let id = 0
  for (let i = 0; i < count; i++) {
    const d = addDays(new Date(), i + 1)
    const dayName = format(d, 'EEEE', { locale: es })
    const dateLabel = i === 0 ? `Mañana, ${format(d, 'd \'de\' MMMM', { locale: es })}` : `${dayName.charAt(0).toUpperCase() + dayName.slice(1)}, ${format(d, 'd \'de\' MMMM', { locale: es })}`
    const displayDate = format(d, "EEEE, d 'de' MMM 'de' yyyy", { locale: es })
    for (const t of TIME_SLOTS_DAY) {
      const startStr = t.start >= 12 ? `${t.start - 12 || 12}:${pad(t.startMin)} p.m.` : `${t.start}:${pad(t.startMin)} a.m.`
      const endStr = t.end >= 12 ? `${t.end - 12 || 12}:${pad(t.endMin)} p.m.` : `${t.end}:${pad(t.endMin)} a.m.`
      const timeRange = `${startStr} – ${endStr}`
      const timeRangeCompact = `${startStr.replace(/\s/g, '')} - ${endStr.replace(/\s/g, '')}`
      slots.push({ id: `slot-${id++}`, dateLabel, timeRange, displayDate, timeRangeCompact })
    }
  }
  return slots
}

function formatPrice(price: number, currency: string) {
  const num = price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (currency === 'COP') return `$${num} COP`
  return `${num} ${currency}`
}

function ExperienceBookContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = params.id as string
  const slotId = searchParams.get('slot')
  const adults = Math.max(1, parseInt(searchParams.get('adults') ?? '1', 10))
  const children = parseInt(searchParams.get('children') ?? '0', 10)

  const [experience, setExperience] = useState<Experience | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [privateBooking, setPrivateBooking] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pse'>('card')
  const [cardFormOpen, setCardFormOpen] = useState(false)
  const [pseFormOpen, setPseFormOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    publicExperiencesApi
      .getById(id)
      .then(setExperience)
      .catch((err) => setError(parseErrorMessage(err, 'Error al cargar la experiencia')))
      .finally(() => setLoading(false))
  }, [id])

  const allSlots = buildMockSlots(6)
  const selectedSlot = slotId ? allSlots.find((s) => s.id === slotId) : allSlots[0]
  const pricePerPerson = experience?.pricePerParticipant ?? 0
  const currency = experience?.currency ?? 'COP'
  const subtotal = pricePerPerson * adults
  const privateExtra = 500000
  const MIN_GROUP_PRICE = 600000
  const privateTotal = Math.max(MIN_GROUP_PRICE, subtotal + privateExtra)
  const total = privateBooking ? privateTotal : subtotal
  const images = Array.isArray(experience?.images) ? experience.images : []
  const thumb = images[0]
  const rating = experience?.averageRating ?? 0
  const totalReviews = experience?.totalReviews ?? 0

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="h-20" />
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="h-32 bg-gray-200 rounded-xl" />
                <div className="h-48 bg-gray-200 rounded-xl" />
              </div>
              <div className="h-64 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !experience) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="h-20" />
        <div className="max-w-xl mx-auto px-6 py-16 text-center">
          <p className="text-red-600 mb-4">{error ?? 'Experiencia no encontrada'}</p>
          <Link href={`/experiences/${id}`} className="text-primary underline">
            Volver al detalle
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const displayDate = selectedSlot?.displayDate ?? selectedSlot?.dateLabel ?? '—'
  const timeDisplay = selectedSlot?.timeRangeCompact ?? selectedSlot?.timeRange ?? '—'

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="h-20" />
      {/* Espacio ~1 cm entre menú y título "Confirma y paga" */}
      <div className="max-w-[860px] mx-auto px-6 md:px-8 pb-24 pt-10">
        {/* Cabecera: solo el símbolo es botón (atrás); el título es texto */}
        <div className="flex items-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-full text-[#222222] hover:bg-[#F7F7F7] active:scale-95 active:bg-[#EBEBEB] transition-all duration-150"
            aria-label="Volver atrás"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2} />
          </button>
          <h1 className="text-[#222222] font-semibold text-2xl">
            Confirma y paga
          </h1>
        </div>

        {/* Esqueleto: dos columnas compactas; tarjetas no ocupan todo el ancho */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,480px)_300px] gap-10 lg:gap-12 items-start justify-center">
          {/* ——— COLUMNA IZQUIERDA (reserva + pago + legal + botón) ——— */}
          <div className="min-w-0 space-y-6">
            {/* Tarjeta: Reserva solo para tu grupo (checkbox a la derecha) */}
            <div className="bg-white rounded-xl border border-[#EBEBEB] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-6 flex flex-row items-start justify-between gap-6">
              <div className="min-w-0">
                <h3 className="text-[18px] font-semibold text-[#222222] mb-2">
                  Reserva solo para tu grupo
                </h3>
                <p className="text-[16px] text-[#222222] mb-1">
                  Hazla privada por {formatPrice(privateExtra, currency)} más
                </p>
                <p className="text-[14px] text-[#717171] mb-3">
                  Solo tienes que alcanzar el mínimo de {formatPrice(MIN_GROUP_PRICE, currency)} que el anfitrión estableció, sin incluir impuestos ni descuentos.
                </p>
                <a href="#" className="text-[14px] text-[#006AFF] underline hover:text-[#0052CC]">
                  Más información.
                </a>
              </div>
              <label className="flex-shrink-0 cursor-pointer pt-0.5">
                <input
                  type="checkbox"
                  checked={privateBooking}
                  onChange={(e) => setPrivateBooking(e.target.checked)}
                  className="w-4 h-4 rounded border-[#B0B0B0] text-[#222222]"
                />
              </label>
            </div>

            {/* Método de pago: siempre visible; clic en el método abre/cierra su formulario */}
            <div className="bg-white rounded-xl border border-[#EBEBEB] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-6">
              <h3 className="text-[18px] font-semibold text-[#222222] mb-4">
                Método de pago
              </h3>
              <div className="space-y-4">
                {/* Tarjeta: clic abre formulario, otro clic lo cierra */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (paymentMethod === 'card') {
                        setCardFormOpen((o) => !o)
                      } else {
                        setPaymentMethod('card')
                        setCardFormOpen(true)
                        setPseFormOpen(false)
                      }
                    }}
                    className={`w-full flex flex-row items-start gap-4 text-left cursor-pointer p-4 rounded-xl border transition-colors ${
                      paymentMethod === 'card' ? 'border-[#222222] bg-[#F7F7F7]' : 'border-[#EBEBEB] hover:border-[#B0B0B0]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      readOnly
                      className="mt-1 w-4 h-4 flex-shrink-0 pointer-events-none"
                    />
                    <CreditCard className="w-6 h-6 text-[#222222] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div className="min-w-0 flex-1">
                      <span className="text-[16px] font-medium text-[#222222] block">
                        Tarjeta de crédito o débito
                      </span>
                      <div className="flex gap-3 mt-2">
                        <span className="text-[12px] text-[#717171]">VISA</span>
                        <span className="text-[12px] text-[#717171]">Mastercard</span>
                      </div>
                    </div>
                  </button>
<div className={`overflow-hidden transition-all duration-300 ease-out ${paymentMethod === 'card' && cardFormOpen ? 'max-h-[420px] opacity-100 mt-4 overflow-y-auto' : 'max-h-0 opacity-0 mt-0'}`}>
                      <div className="space-y-3 px-1 pb-4">
                      <input type="text" placeholder="Número de tarjeta" className="w-full px-4 py-3 border border-[#EBEBEB] rounded-lg text-[16px] text-[#222222] placeholder:text-[#717171] focus:outline-none focus:ring-2 focus:ring-[#222222]" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Caducidad" className="px-4 py-3 border border-[#EBEBEB] rounded-lg text-[16px] focus:outline-none focus:ring-2 focus:ring-[#222222]" />
                        <input type="text" placeholder="Código CVV" className="px-4 py-3 border border-[#EBEBEB] rounded-lg text-[16px] focus:outline-none focus:ring-2 focus:ring-[#222222]" />
                      </div>
                      <input type="text" placeholder="Código postal" className="w-full px-4 py-3 border border-[#EBEBEB] rounded-lg text-[16px] focus:outline-none focus:ring-2 focus:ring-[#222222]" />
                      <select className="w-full px-4 py-3 border border-[#EBEBEB] rounded-lg text-[16px] bg-white focus:outline-none focus:ring-2 focus:ring-[#222222] appearance-none bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23717171\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")' }}>
                        <option>Colombia</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* PSE: clic abre formulario, otro clic lo cierra */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (paymentMethod === 'pse') {
                        setPseFormOpen((o) => !o)
                      } else {
                        setPaymentMethod('pse')
                        setPseFormOpen(true)
                        setCardFormOpen(false)
                      }
                    }}
                    className={`w-full flex flex-row items-start gap-4 text-left cursor-pointer p-4 rounded-xl border transition-colors ${
                      paymentMethod === 'pse' ? 'border-[#222222] bg-[#F7F7F7]' : 'border-[#EBEBEB] hover:border-[#B0B0B0]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'pse'}
                      readOnly
                      className="mt-1 w-4 h-4 flex-shrink-0 pointer-events-none accent-[#006AFF]"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[16px] font-semibold text-[#222222] block">PSE</span>
                      <span className="text-[14px] text-[#717171] block mt-0.5">Pagos seguros en línea (ACH) – Bancos Colombia</span>
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-out ${paymentMethod === 'pse' && pseFormOpen ? 'max-h-[520px] opacity-100 mt-4 overflow-y-auto' : 'max-h-0 opacity-0 mt-0'}`}>
                    <div className="space-y-4 px-1 pb-4">
                      <div>
                        <label className="block text-[14px] font-medium text-[#222222] mb-2">Banco</label>
                        <select className="w-full px-4 py-3 border border-[#EBEBEB] rounded-lg text-[16px] text-[#222222] bg-white focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent appearance-none bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23717171\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")' }}>
                          <option value="">Selecciona tu banco</option>
                          <option>Bancolombia</option>
                          <option>Davivienda</option>
                          <option>BBVA Colombia</option>
                          <option>Banco de Bogotá</option>
                          <option>Banco Popular</option>
                          <option>Nequi</option>
                          <option>Daviplata</option>
                          <option>Otros bancos PSE</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[14px] font-medium text-[#222222] mb-2">Tipo de persona</label>
                        <select className="w-full px-4 py-3 border border-[#EBEBEB] rounded-lg text-[16px] text-[#222222] bg-white focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent appearance-none bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23717171\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")' }}>
                          <option>Persona natural</option>
                          <option>Persona jurídica</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[14px] font-medium text-[#222222] mb-2">Tipo de documento</label>
                        <select className="w-full px-4 py-3 border border-[#EBEBEB] rounded-lg text-[16px] text-[#222222] bg-white focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent appearance-none bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23717171\' stroke-width=\'2\'%3E%3Cpath d=\'M6 9l6 6 6-6\'/%3E%3C/svg%3E")' }}>
                          <option>Cédula de ciudadanía</option>
                          <option>NIT</option>
                          <option>Cédula de extranjería</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[14px] font-medium text-[#222222] mb-2">Número de documento</label>
                        <input type="text" placeholder="Número de documento" className="w-full px-4 py-3 border border-[#EBEBEB] rounded-lg text-[16px] text-[#222222] placeholder:text-[#717171] focus:outline-none focus:ring-2 focus:ring-[#222222] focus:border-transparent" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Texto legal + botón Confirma y paga */}
            <p className="text-[12px] text-[#717171] leading-relaxed">
              Al seleccionar el botón, acepto los{' '}
              <a href="#" className="text-[#006AFF] underline hover:text-[#0052CC]">términos de la reservación</a>
              {' '}y la{' '}
              <a href="#" className="text-[#006AFF] underline hover:text-[#0052CC]">exención y renuncia de responsabilidad</a>.
              Revisa la{' '}
              <a href="#" className="text-[#006AFF] underline hover:text-[#0052CC]">Politica de privacidad</a>.
            </p>
            <button
              type="button"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white text-[16px] font-semibold hover:opacity-95 active:scale-[0.99] transition-transform"
            >
              Confirma y paga
            </button>
          </div>

          {/* ——— COLUMNA DERECHA: Resumen de Reserva (compacto, cabe en pantalla) ——— */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="bg-white rounded-xl border border-[#EBEBEB] shadow-[0_1px_2px_rgba(0,0,0,0.05)] p-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <h3 className="text-[16px] font-semibold text-[#222222] mb-3">
                Resumen de Reserva
              </h3>
              <div className="flex gap-3 mb-3">
                {thumb && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-[#EBEBEB]">
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="text-[14px] font-semibold text-[#222222] leading-tight line-clamp-2">
                    {experience.title}
                  </h4>
                  <p className="text-[12px] text-[#222222] mt-0.5">
                    ★ {rating.toFixed(1)} ({totalReviews})
                  </p>
                </div>
              </div>
              <hr className="border-0 h-px bg-[#EBEBEB] my-2" />
              <p className="text-[12px] text-[#222222]">
                Esta reservación no es reembolsable.
              </p>
              <hr className="border-0 h-px bg-[#EBEBEB] my-2" />
              <div className="mb-2">
                <p className="text-[12px] font-semibold text-[#222222] mb-0.5">Fecha</p>
                <p className="text-[13px] text-[#222222]">{displayDate}</p>
                <p className="text-[13px] text-[#222222]">{timeDisplay}</p>
              </div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <p className="text-[12px] font-semibold text-[#222222] mb-0.5">Huéspedes</p>
                  <p className="text-[13px] text-[#222222]">{adults} adulto{adults !== 1 ? 's' : ''}</p>
                </div>
                <Link href={`/experiences/${id}`} className="px-3 py-1.5 rounded-lg bg-[#EBEBEB] text-[12px] font-medium text-[#222222] hover:bg-[#DDDDDD] transition-colors">
                  Cambiar
                </Link>
              </div>
              <hr className="border-0 h-px bg-[#EBEBEB] my-2" />
              <p className="text-[12px] font-semibold text-[#222222] mb-1">Información del precio</p>
              {privateBooking ? (
                <div className="flex justify-between items-baseline text-[13px] text-[#222222] mb-1">
                  <span>Reserva solo para tu grupo</span>
                  <span>{formatPrice(total, currency)}</span>
                </div>
              ) : (
                <div className="flex justify-between items-baseline text-[13px] text-[#222222] mb-1">
                  <span>{formatPrice(pricePerPerson, currency)} x {adults} adulto{adults !== 1 ? 's' : ''}</span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
              )}
              <hr className="border-0 h-px bg-[#EBEBEB] my-2" />
              <a href="#" className="text-[12px] text-[#006AFF] underline hover:text-[#0052CC]">
                Ingresa un cupón
              </a>
              <hr className="border-0 h-px bg-[#EBEBEB] my-2" />
              <div className="flex justify-between items-baseline text-[14px] font-semibold text-[#222222]">
                <span>Total {currency}</span>
                <span>{formatPrice(total, currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

function ExperienceBookFallback() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="h-20" />
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="h-32 bg-gray-200 rounded-xl" />
              <div className="h-48 bg-gray-200 rounded-xl" />
            </div>
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

export default function ExperienceBookPage() {
  return (
    <Suspense fallback={<ExperienceBookFallback />}>
      <ExperienceBookContent />
    </Suspense>
  )
}
