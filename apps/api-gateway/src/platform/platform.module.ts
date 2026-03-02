import { Global, Module } from '@nestjs/common';
import { KafkaModule } from './messaging/kafka.module';
import { IdempotencyService } from './idempotency/idempotency.service';
import { ResilienceService } from './resilience/resilience.service';
import { CircuitBreakerService } from './resilience/circuit-breaker.service';
import { ExternalAdapterResilienceService } from './resilience/external-adapter-resilience.service';
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
import { MetricsService } from './observability/metrics.service';
import { MetricsController } from './observability/metrics.controller';
import { TraceContextService } from './observability/trace-context.service';

import { PrismaService } from '../common/prisma.service';
 main

@Global()
@Module({
  imports: [KafkaModule],
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
  controllers: [MetricsController],
  providers: [

  providers: [
    PrismaService,
 main
    IdempotencyService,
    ResilienceService,
    CircuitBreakerService,
    ExternalAdapterResilienceService,
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
    MetricsService,
    TraceContextService,
  ],
  exports: [
    KafkaModule,

  ],
  exports: [
    KafkaModule,
    PrismaService,
 main
    IdempotencyService,
    ResilienceService,
    CircuitBreakerService,
    ExternalAdapterResilienceService,
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
    MetricsService,
    TraceContextService,
 main
  ],
})
export class PlatformModule {}
