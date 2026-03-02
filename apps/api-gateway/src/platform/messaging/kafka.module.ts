import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
import { KafkaPublisherService } from './kafka.publisher.service';
import { OutboxRelayService } from './outbox-relay.service';
import { ExternalAdapterResilienceService } from '../resilience/external-adapter-resilience.service';
import { PrismaOutboxClient } from './infrastructure/prisma-outbox.client';
import { ConsumerRegistryService } from './consumers/consumer-registry.service';
import { PrismaPaymentsClient } from '../../contexts/payments/infrastructure/prisma-payments.client';
import { PrismaBookingsClient } from '../../contexts/bookings/infrastructure/prisma-bookings.client';
import { BookingCreatedConsumer } from '../../contexts/payments/application/consumers/booking-created.consumer';
import { PaymentCapturedConsumer } from '../../contexts/bookings/application/consumers/payment-captured.consumer';

import { PrismaService } from '../../common/prisma.service';
import { KafkaPublisherService } from './kafka.publisher.service';
import { OutboxRelayService } from './outbox-relay.service';
import { ExternalAdapterResilienceService } from '../resilience/external-adapter-resilience.service';
 main

@Module({
  imports: [ConfigModule],
  providers: [
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
    PrismaOutboxClient,
    PrismaPaymentsClient,
    PrismaBookingsClient,
    ExternalAdapterResilienceService,
    ConsumerRegistryService,
    KafkaPublisherService,
    OutboxRelayService,
    BookingCreatedConsumer,
    PaymentCapturedConsumer,
  ],
  exports: [KafkaPublisherService, OutboxRelayService, ConsumerRegistryService],

    PrismaService,
    ExternalAdapterResilienceService,
    KafkaPublisherService,
    OutboxRelayService,
  ],
  exports: [KafkaPublisherService, OutboxRelayService],
 main
})
export class KafkaModule {}
