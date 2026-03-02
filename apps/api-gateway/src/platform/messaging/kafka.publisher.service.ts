import { Injectable, Logger } from '@nestjs/common';

export interface IntegrationEvent<TPayload = Record<string, unknown>> {
  topic: string;
  key: string;
  payload: TPayload;
}

@Injectable()
export class KafkaPublisherService {
  private readonly logger = new Logger(KafkaPublisherService.name);

  async publish(event: IntegrationEvent): Promise<void> {
    // Placeholder adapter for Event-Driven evolution.
    // Real Kafka client (kafkajs/confluent) can be plugged here without touching domain/application layers.
    this.logger.debug(
      `Publishing event to topic=${event.topic} key=${event.key} payload=${JSON.stringify(event.payload)}`,
    );
  }
}
