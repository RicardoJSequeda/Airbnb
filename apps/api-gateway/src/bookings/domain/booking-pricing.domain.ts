/**
 * Cálculos de precio y comisión de reservas.
 * Dominio puro: solo number y redondeo a 2 decimales. Sin Prisma ni dependencias externas.
 */

/**
 * Calcula el total de una reserva (precio por noche × noches) con 2 decimales.
 */
export function calculateBookingTotal(
  pricePerNight: number,
  nights: number,
): number {
  const total = pricePerNight * nights;
  return Math.round(total * 100) / 100;
}

/**
 * Calcula la comisión de plataforma y el neto para el host.
 * @param totalAmount - Monto total (number)
 * @param feePercentage - Porcentaje de comisión (ej: 10 para 10%)
 * @returns platformFee y hostNet con 2 decimales
 */
export function calculatePlatformFee(
  totalAmount: number,
  feePercentage: number,
): { platformFee: number; hostNet: number } {
  const pct = feePercentage / 100;
  const platformFee = Math.round(totalAmount * pct * 100) / 100;
  const hostNet = Math.round((totalAmount - platformFee) * 100) / 100;
  return { platformFee, hostNet };
}
