import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DiagnosticController } from './diagnostic.controller';
import { PrismaBookingsClient } from '../contexts/bookings/infrastructure/prisma-bookings.client';
import { PrismaPaymentsClient } from '../contexts/payments/infrastructure/prisma-payments.client';
import { PrismaOutboxClient } from '../platform/messaging/infrastructure/prisma-outbox.client';
import { RedisService } from '../common/redis.service';
import { KafkaPublisherService } from '../platform/messaging/kafka.publisher.service';
import { ExternalAdapterResilienceService } from '../platform/resilience/external-adapter-resilience.service';
import { MetricsService } from '../platform/observability/metrics.service';
import { TraceContextService } from '../platform/observability/trace-context.service';

@Module({
  controllers: [HealthController, DiagnosticController],
  providers: [
    HealthService,
    PrismaBookingsClient,
    PrismaPaymentsClient,
    PrismaOutboxClient,
    RedisService,
    KafkaPublisherService,
    ExternalAdapterResilienceService,
    MetricsService,
    TraceContextService,
  ],
})
export class HealthModule {}
