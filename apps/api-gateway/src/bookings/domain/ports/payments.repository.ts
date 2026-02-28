/**
 * Puerto de salida para persistencia de pagos (por reserva).
 * Dominio/Application no importan Prisma.
 */

export interface PaymentSnapshot {
  id: string;
  bookingId: string;
  stripePaymentIntentId: string | null;
  status: string;
  amount: number;
}

export interface UpdatePaymentStatusData {
  status: string;
  paidAt?: Date;
  platformFeeAmount?: number;
  hostNetAmount?: number;
}

export interface IPaymentsRepository {
  findByBookingId(bookingId: string): Promise<PaymentSnapshot | null>;

  updateStatus(
    bookingId: string,
    data: UpdatePaymentStatusData,
  ): Promise<void>;
}
