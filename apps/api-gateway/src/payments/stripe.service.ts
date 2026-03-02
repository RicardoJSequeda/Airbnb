import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  ExternalAdapterResilienceService,
  type AdapterPolicy,
} from '../platform/resilience/external-adapter-resilience.service';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);
  private readonly policy: AdapterPolicy;

  constructor(
    private readonly configService: ConfigService,
    private readonly resilience: ExternalAdapterResilienceService,
  ) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!apiKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not defined in environment variables',
      );
    }

    this.stripe = new Stripe(apiKey, {
      apiVersion: '2026-02-25.clover',
      typescript: true,
    });

    this.policy = {
      timeoutMs: Number(configService.get('STRIPE_TIMEOUT_MS') ?? 7000),
      retries: Number(configService.get('STRIPE_RETRIES') ?? 2),
      baseDelayMs: Number(configService.get('STRIPE_RETRY_BASE_MS') ?? 200),
      maxDelayMs: Number(configService.get('STRIPE_RETRY_MAX_MS') ?? 2500),
      jitterMs: Number(configService.get('STRIPE_RETRY_JITTER_MS') ?? 200),
      failureThreshold: Number(configService.get('STRIPE_CB_FAILURES') ?? 5),
      circuitOpenMs: Number(configService.get('STRIPE_CB_OPEN_MS') ?? 12000),
    };
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>,
    captureManual = false,
  ) {
    return this.execute('createPaymentIntent', () =>
      this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        metadata,
        capture_method: captureManual ? 'manual' : 'automatic',
        automatic_payment_methods: {
          enabled: true,
        },
      }),
    );
  }

  async cancelPaymentIntent(paymentIntentId: string) {
    return this.execute('cancelPaymentIntent', () =>
      this.stripe.paymentIntents.cancel(paymentIntentId),
    );
  }

  async capturePaymentIntent(paymentIntentId: string) {
    return this.execute('capturePaymentIntent', () =>
      this.stripe.paymentIntents.capture(paymentIntentId),
    );
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    return this.execute('retrievePaymentIntent', () =>
      this.stripe.paymentIntents.retrieve(paymentIntentId),
    );
  }

  async createRefund(paymentIntentId: string, amount?: number) {
    return this.execute('createRefund', () =>
      this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      }),
    );
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    const webhookSecret =
      this.configService.get<string>('STRIPE_WEBHOOK_SECRET') ?? '';
    if (!webhookSecret || webhookSecret.trim() === '') {
      throw new BadRequestException(
        'STRIPE_WEBHOOK_SECRET is required for webhook verification. Set it in Railway environment variables.',
      );
    }
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }

  private async execute<T>(
    name: string,
    operation: () => Promise<T>,
  ): Promise<T> {
    const result = await this.resilience.execute(
      'stripe-adapter',
      operation,
      this.policy,
    );
    const metrics = this.resilience.getMetrics('stripe-adapter');
    this.logger.verbose(
      `stripe operation=${name} calls=${metrics.calls} failures=${metrics.failures} retries=${metrics.retries} timeouts=${metrics.timeouts}`,
    );
    return result;
  }
}
