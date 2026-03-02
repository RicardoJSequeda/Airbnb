import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { KafkaPublisherService } from './kafka.publisher.service';
import { OutboxRelayService } from './outbox-relay.service';
import { ExternalAdapterResilienceService } from '../resilience/external-adapter-resilience.service';

@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    ExternalAdapterResilienceService,
    KafkaPublisherService,
    OutboxRelayService,
  ],
  exports: [KafkaPublisherService, OutboxRelayService],
})
export class KafkaModule {}
