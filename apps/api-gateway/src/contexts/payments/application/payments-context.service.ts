import { Injectable } from '@nestjs/common';
import { PaymentsService } from '../../../payments/payments.service';
import type { CreatePaymentIntentDto } from '../../../payments/dto/create-payment-intent.dto';
import type { ConfirmPaymentDto } from '../../../payments/dto/confirm-payment.dto';
import type { PaymentsContextPort } from '../contracts/payments-context.port';

@Injectable()
export class PaymentsContextService implements PaymentsContextPort {
  constructor(private readonly paymentsService: PaymentsService) {}

  createPaymentIntent(dto: CreatePaymentIntentDto, userId: string) {
    return this.paymentsService.createPaymentIntent(dto, userId);
  }

  confirmPayment(dto: ConfirmPaymentDto, userId: string) {
    return this.paymentsService.confirmPayment(dto, userId);
  }

  getPaymentByBooking(bookingId: string, userId: string, organizationId?: string | null) {
    return this.paymentsService.getPaymentByBooking(bookingId, userId, organizationId);
  }

  refundPayment(paymentId: string, userId: string, organizationId?: string | null) {
    return this.paymentsService.refundPayment(paymentId, userId, organizationId);
  }

  handleWebhook(sig: string, rawBody: Buffer) {
    return this.paymentsService.handleWebhook(rawBody, sig);
  }
}
