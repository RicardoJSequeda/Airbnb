/**
 * Dominio puro - sin infraestructura.
 * Reglas de disponibilidad: solapamiento de fechas y conflicto con reservas existentes.
 * No depende de Prisma, Redis, Stripe ni ningún ORM.
 */

/**
 * Retorna true si los rangos [startA, endA] y [startB, endB] se solapan.
 * Solapamiento: startA < endB && endA > startB (ambos extremos inclusivos en día).
 */
export function datesOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
): boolean {
  return startA < endB && endA > startB;
}

/** Estados que no bloquean disponibilidad (la reserva no ocupa el slot). */
const NON_BLOCKING_STATUSES = ['CANCELLED', 'REJECTED', 'REFUNDED'];

export type ExistingBookingSlot = {
  startDate: Date;
  endDate: Date;
  status: string;
};

/**
 * Determina si el rango solicitado entra en conflicto con alguna reserva existente que bloquee.
 * Ignora reservas canceladas o rechazadas (y reembolsadas).
 * Usa datesOverlap internamente.
 */
export function hasDateConflict(
  requestedStart: Date,
  requestedEnd: Date,
  existingBookings: ExistingBookingSlot[],
): boolean {
  for (const b of existingBookings) {
    if (NON_BLOCKING_STATUSES.includes(b.status)) continue;
    if (
      datesOverlap(requestedStart, requestedEnd, b.startDate, b.endDate)
    ) {
      return true;
    }
  }
  return false;
}
