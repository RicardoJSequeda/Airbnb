import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma.service';
import { ConsumerRegistryService } from './consumer-registry.service';
import {
  BOOKING_CREATED_V1_TOPIC,
  parseBookingCreatedV1Event,
} from '../../../contexts/bookings/contracts/events/booking-created.v1.event';

@Injectable()
export class BookingCreatedConsumer implements OnModuleInit {
  readonly consumerGroup = 'payments.booking-created.v1';

  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: ConsumerRegistryService,
  ) {}

  onModuleInit(): void {
    if (process.env.PROCESS_ROLE !== 'worker') return;

    this.registry.register({
      consumerGroup: this.consumerGroup,
      topic: BOOKING_CREATED_V1_TOPIC,
      handle: async (message) => {
        const event = parseBookingCreatedV1Event({
          name: 'booking.created',
          version: 'v1',
          metadata: {
            eventId: message.eventId,
            occurredAt: new Date().toISOString(),
            correlationId: message.correlationId ?? 'n/a',
          },
          payload: message.payload,
        });

        await this.prisma.paymentSummary.upsert({
          where: { bookingId: event.payload.bookingId },
          create: {
            paymentId: event.payload.bookingId,
            bookingId: event.payload.bookingId,
            organizationId: event.payload.organizationId,
            tenantId: message.tenantId ?? 'default',
            regionId: message.regionId ?? 'global',
            status: 'PENDING',
            amount: event.payload.totalPrice,
            currency: event.payload.currency,
          },
          update: {
            organizationId: event.payload.organizationId,
            status: 'PENDING',
            amount: event.payload.totalPrice,
            currency: event.payload.currency,
            tenantId: message.tenantId ?? 'default',
            regionId: message.regionId ?? 'global',
          },
        });
      },
    });
  }
}
