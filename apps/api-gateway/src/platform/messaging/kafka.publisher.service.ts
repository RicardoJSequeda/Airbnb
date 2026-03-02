import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ExternalAdapterResilienceService,
  type AdapterPolicy,
} from '../resilience/external-adapter-resilience.service';

export interface IntegrationEvent<TPayload = Record<string, unknown>> {
  topic: string;
  key: string;
  payload: TPayload;
  version?: string;
  correlationId?: string;
}

@Injectable()
export class KafkaPublisherService {
  private readonly logger = new Logger(KafkaPublisherService.name);
  private readonly policy: AdapterPolicy;

  constructor(
    private readonly resilience: ExternalAdapterResilienceService,
    private readonly configService: ConfigService,
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

  async publish(event: IntegrationEvent): Promise<void> {
    await this.resilience.execute(
      'kafka-publisher',
      () => {
        // Placeholder adapter for Event-Driven evolution.
        // Real Kafka producer integration should be plugged here.
        this.logger.debug(
          `Publishing event topic=${event.topic} version=${event.version ?? 'v1'} key=${event.key} correlationId=${event.correlationId ?? 'n/a'}`,
        );
      },
      this.policy,
    );

    const metrics = this.resilience.getMetrics('kafka-publisher');
    this.logger.verbose(
      `kafka metrics calls=${metrics.calls} failures=${metrics.failures} retries=${metrics.retries} timeouts=${metrics.timeouts}`,
    );
  }
}
