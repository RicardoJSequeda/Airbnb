/**
 * Puerto de salida para pasarela de pago.
 * Application no importa Stripe SDK.
 */

export interface CreatePaymentIntentResult {
  id: string;
  client_secret: string | null;
}

export interface PaymentIntentStatusResult {
  status: string;
}

export interface IStripePort {
  createPaymentIntent(
    amount: number,
    currency: string,
    metadata?: Record<string, string>,
    captureManual?: boolean,
  ): Promise<CreatePaymentIntentResult>;

  cancelPaymentIntent(paymentIntentId: string): Promise<void>;

  capturePaymentIntent(paymentIntentId: string): Promise<void>;

  retrievePaymentIntent(
    paymentIntentId: string,
  ): Promise<PaymentIntentStatusResult>;
}
