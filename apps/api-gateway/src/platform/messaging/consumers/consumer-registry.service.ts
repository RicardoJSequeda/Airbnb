import { Injectable, Logger } from '@nestjs/common';
import type { InternalConsumer } from './internal-consumer.interface';
import { PrismaOutboxClient } from '../infrastructure/prisma-outbox.client';

@Injectable()
export class ConsumerRegistryService {
  private readonly logger = new Logger(ConsumerRegistryService.name);
  private readonly consumers = new Map<string, InternalConsumer[]>();

  constructor(private readonly prisma: PrismaOutboxClient) {}

  register(consumer: InternalConsumer): void {
    const list = this.consumers.get(consumer.topic) ?? [];
    list.push(consumer);
    this.consumers.set(consumer.topic, list);
  }

  async dispatch(event: {
    eventId: string;
    topic: string;
    payload: Record<string, unknown>;
    correlationId?: string;
    tenantId?: string;
    regionId?: string;
  }): Promise<void> {
    const handlers = this.consumers.get(event.topic) ?? [];
    for (const consumer of handlers) {
      const done = await this.prisma.consumedEvent.findUnique({
        where: {
          consumerGroup_eventId: {
            consumerGroup: consumer.consumerGroup,
            eventId: event.eventId,
          },
        },
      });
      if (done) continue;

      await consumer.handle(event);

      await this.prisma.consumedEvent.create({
        data: {
          consumerGroup: consumer.consumerGroup,
          eventId: event.eventId,
          topic: event.topic,
        },
      });
    }

    if (handlers.length > 0) {
      this.logger.debug(
        `dispatched topic=${event.topic} handlers=${handlers.length}`,
      );
    }
  }
}
