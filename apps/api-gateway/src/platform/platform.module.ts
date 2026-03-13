import { Global, Module } from '@nestjs/common';
import { KafkaModule } from './messaging/kafka.module';
import { IdempotencyService } from './idempotency/idempotency.service';
import { PrismaIdempotencyClient } from './idempotency/infrastructure/prisma-idempotency.client';
import { ResilienceService } from './resilience/resilience.service';
import { CircuitBreakerService } from './resilience/circuit-breaker.service';
import { ExternalAdapterResilienceService } from './resilience/external-adapter-resilience.service';
import { MetricsService } from './observability/metrics.service';
import { MetricsController } from './observability/metrics.controller';
import { TraceContextService } from './observability/trace-context.service';
import { InterestsController } from './interests.controller';
import { InterestsService } from './interests.service';
import { PrismaService } from '../common/prisma.service';

@Global()
@Module({
  imports: [KafkaModule],
  controllers: [MetricsController, InterestsController],
  providers: [
    PrismaIdempotencyClient,
    IdempotencyService,
    ResilienceService,
    CircuitBreakerService,
    ExternalAdapterResilienceService,
    MetricsService,
    TraceContextService,
    InterestsService,
    PrismaService
  ],
  exports: [
    KafkaModule,
    PrismaIdempotencyClient,
    IdempotencyService,
    ResilienceService,
    CircuitBreakerService,
    ExternalAdapterResilienceService,
    MetricsService,
    TraceContextService,
    InterestsService
  ],
})
export class PlatformModule {}
