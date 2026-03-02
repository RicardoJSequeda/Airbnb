import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ExternalAdapterResilienceService,
  type AdapterPolicy,
} from '../resilience/external-adapter-resilience.service';
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
import { MetricsService } from '../observability/metrics.service';
import { TraceContextService } from '../observability/trace-context.service';

 main

export interface IntegrationEvent<TPayload = Record<string, unknown>> {
  topic: string;
  key: string;
  payload: TPayload;
  version?: string;
  correlationId?: string;
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
  regionId?: string;

 main
}

@Injectable()
export class KafkaPublisherService {
  private readonly logger = new Logger(KafkaPublisherService.name);
  private readonly policy: AdapterPolicy;

  constructor(
    private readonly resilience: ExternalAdapterResilienceService,
    private readonly configService: ConfigService,
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
    private readonly metrics: MetricsService,
    private readonly traceContext: TraceContextService,

 main
  ) {
    this.policy = {
      timeoutMs: Number(configService.get('KAFKA_TIMEOUT_MS') ?? 5000),
      retries: Number(configService.get('KAFKA_RETRIES') ?? 3),
      baseDelayMs: Number(configService.get('KAFKA_RETRY_BASE_MS') ?? 200),
      maxDelayMs: Number(configService.get('KAFKA_RETRY_MAX_MS') ?? 3000),
      jitterMs: Number(configService.get('KAFKA_RETRY_JITTER_MS') ?? 250),
      failureThreshold: Number(configService.get('KAFKA_CB_FAILURES') ?? 5),
      circuitOpenMs: Number(configService.get('KAFKA_CB_OPEN_MS') ?? 10000),
    };
  }

 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
  toRegionalTopic(topic: string, regionId?: string): string {
    const region =
      regionId ?? this.configService.get<string>('REGION_ID') ?? 'global';
    return `${region}.${topic}`;
  }

  async publish(event: IntegrationEvent): Promise<void> {
    const regionalTopic = this.toRegionalTopic(event.topic, event.regionId);

    await this.resilience.execute(
      'kafka-publisher',
      async () => {
        this.logger.debug(
          `Publishing event topic=${regionalTopic} version=${event.version ?? 'v1'} key=${event.key} traceId=${this.traceContext.getTraceId()} correlationId=${event.correlationId ?? this.traceContext.getCorrelationId()}`,
        );
        await Promise.resolve();

  async publish(event: IntegrationEvent): Promise<void> {
    await this.resilience.execute(
      'kafka-publisher',
      () => {
        // Placeholder adapter for Event-Driven evolution.
        // Real Kafka producer integration should be plugged here.
        this.logger.debug(
          `Publishing event topic=${event.topic} version=${event.version ?? 'v1'} key=${event.key} correlationId=${event.correlationId ?? 'n/a'}`,
        );
 main
      },
      this.policy,
    );

 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
    this.metrics.inc('kafka_publish_total');
  }

  async publishDeadLetter(
    event: IntegrationEvent,
    errorMessage: string,
  ): Promise<void> {
    const deadLetterTopic = `${event.topic}.dlq`;
    this.metrics.inc('kafka_dead_letter_total');
    await this.publish({
      ...event,
      topic: deadLetterTopic,
      payload: {
        originalPayload: event.payload,
        errorMessage,
      } as Record<string, unknown>,
    });
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.publish({
        topic: 'platform.health.v1',
        key: 'health-check',
        payload: { ts: new Date().toISOString() },
      });
      return true;
    } catch {
      return false;
    }
=======
    const metrics = this.resilience.getMetrics('kafka-publisher');
    this.logger.verbose(
      `kafka metrics calls=${metrics.calls} failures=${metrics.failures} retries=${metrics.retries} timeouts=${metrics.timeouts}`,
    );
 main
  }
}
