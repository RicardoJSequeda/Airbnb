import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KafkaPublisherService } from './kafka.publisher.service';
import { OutboxRelayService } from './outbox-relay.service';
import { ExternalAdapterResilienceService } from '../resilience/external-adapter-resilience.service';
import { PrismaOutboxClient } from './infrastructure/prisma-outbox.client';
import { PrismaService } from '../../common/prisma.service';
import { ConsumerRegistryService } from './consumers/consumer-registry.service';
import { BookingCreatedConsumer } from './consumers/booking-created.consumer';
import { PaymentCapturedConsumer } from './consumers/payment-captured.consumer';

@Module({
  imports: [ConfigModule],
  providers: [
    PrismaOutboxClient,
    PrismaService,
    ExternalAdapterResilienceService,
    ConsumerRegistryService,
    KafkaPublisherService,
    OutboxRelayService,
    BookingCreatedConsumer,
    PaymentCapturedConsumer,
  ],
  exports: [KafkaPublisherService, OutboxRelayService, ConsumerRegistryService],
})
export class KafkaModule {}
