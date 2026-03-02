import { Global, Module } from '@nestjs/common';
import { KafkaModule } from './messaging/kafka.module';
import { IdempotencyService } from './idempotency/idempotency.service';
import { ResilienceService } from './resilience/resilience.service';
import { CircuitBreakerService } from './resilience/circuit-breaker.service';
import { ExternalAdapterResilienceService } from './resilience/external-adapter-resilience.service';
import { MetricsService } from './observability/metrics.service';
import { MetricsController } from './observability/metrics.controller';
import { TraceContextService } from './observability/trace-context.service';

@Global()
@Module({
  imports: [KafkaModule],
  controllers: [MetricsController],
  providers: [
    IdempotencyService,
    ResilienceService,
    CircuitBreakerService,
    ExternalAdapterResilienceService,
    MetricsService,
    TraceContextService,
  ],
  exports: [
    KafkaModule,
    IdempotencyService,
    ResilienceService,
    CircuitBreakerService,
    ExternalAdapterResilienceService,
    MetricsService,
    TraceContextService,
  ],
})
export class PlatformModule {}
