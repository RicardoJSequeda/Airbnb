import { Module } from '@nestjs/common';
import { KafkaModule } from './messaging/kafka.module';
import { IdempotencyService } from './idempotency/idempotency.service';
import { ResilienceService } from './resilience/resilience.service';
import { CircuitBreakerService } from './resilience/circuit-breaker.service';

@Module({
  imports: [KafkaModule],
  providers: [IdempotencyService, ResilienceService, CircuitBreakerService],
  exports: [KafkaModule, IdempotencyService, ResilienceService, CircuitBreakerService],
})
export class PlatformModule {}
