/**
 * Calcula la comisión de plataforma y el neto para el host.
 *
 * @deprecated Usar calculatePlatformFee de bookings/domain/booking-pricing.domain (dominio puro).
 *
 * @param totalAmount - Monto total de la reserva (number)
 * @param feePercentage - Porcentaje de comisión (ej: 10 para 10%)
 * @returns platformFee y hostNet con precisión de 2 decimales
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
