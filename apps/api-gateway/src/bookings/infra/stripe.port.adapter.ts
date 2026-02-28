/**
 * Adaptador que implementa IStripePort delegando en StripeService.
 * La capa de aplicación no importa Stripe SDK.
 */

import type { IStripePort } from '../domain/ports/stripe.port';
import { StripeService } from '../../payments/stripe.service';

export class StripePortAdapter implements IStripePort {
  constructor(private readonly stripeService: StripeService) {}

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, string>,
    captureManual?: boolean,
  ) {
    const pi = await this.stripeService.createPaymentIntent(
      amount,
      currency,
      metadata,
      captureManual,
    );
    return { id: pi.id, client_secret: pi.client_secret };
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<void> {
    await this.stripeService.cancelPaymentIntent(paymentIntentId);
  }

  async capturePaymentIntent(paymentIntentId: string): Promise<void> {
    await this.stripeService.capturePaymentIntent(paymentIntentId);
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    const pi = await this.stripeService.retrievePaymentIntent(paymentIntentId);
    return { status: pi.status };
  }
}
