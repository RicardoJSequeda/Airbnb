import { Prisma } from '@prisma/client';

/**
 * Calcula la comisión de plataforma y el neto para el host usando Prisma.Decimal
 * para evitar errores de punto flotante (ej: 0.1 + 0.2 !== 0.3 en IEEE 754).
 *
 * @param totalAmount - Monto total de la reserva (Decimal o number)
 * @param feePercentage - Porcentaje de comisión (ej: 10 para 10%)
 * @returns platformFee y hostNet con precisión de 2 decimales
 */
export function calculatePlatformFee(
  totalAmount: Prisma.Decimal | number,
  feePercentage: number,
): { platformFee: Prisma.Decimal; hostNet: Prisma.Decimal } {
  const total =
    totalAmount instanceof Prisma.Decimal
      ? totalAmount
      : new Prisma.Decimal(totalAmount);

  const pct = new Prisma.Decimal(feePercentage).div(100);
  const platformFee = total
    .mul(pct)
    .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
  const hostNet = total
    .minus(platformFee)
    .toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);

  return { platformFee, hostNet };
}
