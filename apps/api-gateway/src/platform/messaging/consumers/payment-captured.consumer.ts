import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { ConsumerRegistryService } from './consumer-registry.service';
import {
  PAYMENT_CAPTURED_V1_TOPIC,
  parsePaymentCapturedV1Event,
} from '../../../contexts/payments/contracts/events/payment-captured.v1.event';

@Injectable()
export class PaymentCapturedConsumer implements OnModuleInit {
  readonly consumerGroup = 'bookings.payment-captured.v1';

  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: ConsumerRegistryService,
  ) {}

  onModuleInit(): void {
    if (process.env.PROCESS_ROLE !== 'worker') return;

    this.registry.register({
      consumerGroup: this.consumerGroup,
      topic: PAYMENT_CAPTURED_V1_TOPIC,
      handle: async (message) => {
        const event = parsePaymentCapturedV1Event({
          name: 'payment.captured',
          version: 'v1',
          metadata: {
            eventId: message.eventId,
            occurredAt: new Date().toISOString(),
            correlationId: message.correlationId ?? 'n/a',
          },
          payload: message.payload,
        });

        await this.prisma.bookingSummary.updateMany({
          where: { bookingId: event.payload.bookingId },
          data: { paymentStatus: 'CAPTURED' },
        });
      },
    });
  }
}
