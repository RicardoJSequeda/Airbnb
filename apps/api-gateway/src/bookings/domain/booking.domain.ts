export enum BookingDateValidationError {
  CheckInInPast = 'CHECK_IN_IN_PAST',
  CheckOutBeforeCheckIn = 'CHECK_OUT_BEFORE_CHECK_IN',
}

/**
 * Validaciones y lógica básica de dominio para reservas.
 * No depende de NestJS, Prisma ni de infraestructura.
 */
export function validateBookingDates(
  checkIn: Date,
  checkOut: Date,
  now: Date = new Date(),
): BookingDateValidationError | null {
  if (checkIn < now) {
    return BookingDateValidationError.CheckInInPast
  }

  if (checkOut <= checkIn) {
    return BookingDateValidationError.CheckOutBeforeCheckIn
  }

  return null
}

export function calculateNights(checkIn: Date, checkOut: Date): number {
  const diffMs = checkOut.getTime() - checkIn.getTime()
  const oneNightMs = 1000 * 60 * 60 * 24
  return Math.ceil(diffMs / oneNightMs)
}

/** Estados de reserva (alineado con Prisma BookingStatus). Dominio no importa Prisma. */
export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  REFUNDED: 'REFUNDED',
} as const

export type BookingStatusType = (typeof BookingStatus)[keyof typeof BookingStatus]

/**
 * Reglas de negocio: qué transiciones de estado están permitidas.
 * La autorización (quién puede cancelar/confirmar) sigue en la capa de aplicación.
 */
export function canCancel(status: string): boolean {
  return status !== BookingStatus.CANCELLED && status !== BookingStatus.COMPLETED
}

export function canConfirm(status: string): boolean {
  return status === BookingStatus.PENDING
}

export function canReject(status: string): boolean {
  return status === BookingStatus.PENDING
}

/**
 * Puerta de salida para lecturas de reservas.
 * No acopla el dominio a Prisma; la implementación concreta vive en infraestructura.
 */
export interface IBookingsReadRepository {
  findAllByGuest(
    guestId: string,
    organizationId: string,
  ): Promise<any[]>

  findAllByHost(
    hostId: string,
    organizationId?: string | null,
  ): Promise<any[]>
}

