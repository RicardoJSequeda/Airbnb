import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DiagnosticController } from './diagnostic.controller';
import { PrismaService } from '../common/prisma.service';
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
    PrismaService,
    PrismaOutboxClient,
    RedisService,
    KafkaPublisherService,
    ExternalAdapterResilienceService,
    MetricsService,
    TraceContextService,
  ],
})
export class HealthModule {}
