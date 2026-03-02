import { Global, Module } from '@nestjs/common';
import { KafkaModule } from './messaging/kafka.module';
import { IdempotencyService } from './idempotency/idempotency.service';
import { ResilienceService } from './resilience/resilience.service';
import { CircuitBreakerService } from './resilience/circuit-breaker.service';
import { ExternalAdapterResilienceService } from './resilience/external-adapter-resilience.service';
import { PrismaService } from '../common/prisma.service';

@Global()
@Module({
  imports: [KafkaModule],
  providers: [
    PrismaService,
    IdempotencyService,
    ResilienceService,
    CircuitBreakerService,
    ExternalAdapterResilienceService,
  ],
  exports: [
    KafkaModule,
    PrismaService,
    IdempotencyService,
    ResilienceService,
    CircuitBreakerService,
    ExternalAdapterResilienceService,
  ],
})
export class PlatformModule {}
