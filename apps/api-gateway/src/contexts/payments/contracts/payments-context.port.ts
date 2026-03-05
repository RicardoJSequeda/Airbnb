import type { CreatePaymentIntentDto } from '../../../payments/dto/create-payment-intent.dto';
import type { ConfirmPaymentDto } from '../../../payments/dto/confirm-payment.dto';

export const PAYMENTS_CONTEXT_PORT = 'PAYMENTS_CONTEXT_PORT';

export interface PaymentsContextPort {
  createPaymentIntent(dto: CreatePaymentIntentDto, userId: string): Promise<unknown>;
  confirmPayment(dto: ConfirmPaymentDto, userId: string): Promise<unknown>;
  getPaymentByBooking(bookingId: string, userId: string, organizationId?: string | null): Promise<unknown>;
  refundPayment(paymentId: string, userId: string, organizationId?: string | null): Promise<unknown>;
  handleWebhook(sig: string, rawBody: Buffer): Promise<unknown>;
}
