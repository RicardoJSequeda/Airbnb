import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaOutboxClient } from './infrastructure/prisma-outbox.client';
import { KafkaPublisherService } from './kafka.publisher.service';
import { ConsumerRegistryService } from './consumers/consumer-registry.service';
import { MetricsService } from '../observability/metrics.service';

interface OutboxEventRecord {
  id: string;
  eventId: string;
  aggregateId: string;
  type: string;
  version?: string;
  payload: unknown;
  correlationId?: string;
  tenantId?: string;
  regionId?: string;
  retryCount?: number;
  createdAt?: Date;
}

@Injectable()
export class OutboxRelayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelayService.name);
  private timer?: NodeJS.Timeout;
  private isRunning = false;

  private readonly batchSize: number;
  private readonly maxAttempts: number;
  private readonly baseDelayMs: number;
  private readonly maxDelayMs: number;

  constructor(
    private readonly prisma: PrismaOutboxClient,
    private readonly kafkaPublisher: KafkaPublisherService,
    private readonly consumerRegistry: ConsumerRegistryService,
    private readonly metrics: MetricsService,
    private readonly configService: ConfigService,
  ) {
    this.batchSize = Number(configService.get('OUTBOX_RELAY_BATCH_SIZE') ?? 50);
    this.maxAttempts = Number(configService.get('OUTBOX_MAX_ATTEMPTS') ?? 8);
    this.baseDelayMs = Number(configService.get('OUTBOX_RETRY_BASE_MS') ?? 500);
    this.maxDelayMs = Number(configService.get('OUTBOX_RETRY_MAX_MS') ?? 60000);
  }

  onModuleInit(): void {
    const enabled =
      this.configService.get<string>('OUTBOX_RELAY_ENABLED') !== 'false' &&
      this.configService.get<string>('PROCESS_ROLE') === 'worker' &&
      this.configService.get<string>('OUTBOX_WORKER_ENABLED') !== 'false';

    if (!enabled) {
      this.logger.log('Outbox relay disabled by configuration');
      return;
    }

    const intervalMs = Number(
      this.configService.get<string>('OUTBOX_RELAY_INTERVAL_MS') ?? '5000',
    );

    this.timer = setInterval(() => {
      void this.flushPendingEvents();
    }, intervalMs);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  async flushPendingEvents(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    try {
      let hasMore = true;
      while (hasMore) {
        const batch = await this.fetchBatchWithLock(this.batchSize);
        hasMore = batch.length === this.batchSize;

        for (const event of batch) {
          await this.processEvent(event);
        }
      }
    } finally {
      this.isRunning = false;
    }
  }

  private get prismaOutbox() {
    return this.prisma as unknown as {
      outboxEvent?: {
        findMany: (args: unknown) => Promise<OutboxEventRecord[]>;
        update: (args: unknown) => Promise<unknown>;
      };
      outboxDeadLetter?: {
        create: (args: unknown) => Promise<unknown>;
      };
      $queryRawUnsafe: <T>(query: string, ...params: unknown[]) => Promise<T>;
    };
  }

  private async fetchBatchWithLock(
    limit: number,
  ): Promise<OutboxEventRecord[]> {
    const rows = await this.prismaOutbox.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id
       FROM bookings.outbox_events
       WHERE "processedAt" IS NULL
         AND "deadLetteredAt" IS NULL
         AND "retryCount" < $1
         AND ("nextRetryAt" IS NULL OR "nextRetryAt" <= NOW())
       ORDER BY "createdAt" ASC
       FOR UPDATE SKIP LOCKED
       LIMIT $2`,
      this.maxAttempts,
      limit,
    );

    if (!rows.length) {
      return [];
    }

    return this.prisma.outboxEvent.findMany({
      where: { id: { in: rows.map((r) => r.id) } },
    }) as unknown as Promise<OutboxEventRecord[]>;
  }

  private async processEvent(event: OutboxEventRecord): Promise<void> {
    const topicName = `${event.type}.${event.version ?? 'v1'}`;
    try {
      await this.kafkaPublisher.publish({
        topic: topicName,
        key: event.aggregateId,
        version: event.version ?? 'v1',
        correlationId: event.correlationId,
        regionId: event.regionId,
        payload:
          typeof event.payload === 'object' && event.payload !== null
            ? (event.payload as Record<string, unknown>)
            : { value: event.payload },
      });

      await this.consumerRegistry.dispatch({
        eventId: event.eventId,
        topic: topicName,
        payload:
          typeof event.payload === 'object' && event.payload !== null
            ? (event.payload as Record<string, unknown>)
            : { value: event.payload },
        correlationId: event.correlationId,
        tenantId: (event as { tenantId?: string }).tenantId,
        regionId: (event as { regionId?: string }).regionId,
      });

      this.metrics.inc('outbox_processed_total');
      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          processedAt: new Date(),
          lastError: null,
        },
      });
    } catch (error) {
      const retryCount = (event.retryCount ?? 0) + 1;
      this.metrics.inc('outbox_retry_total');
      const message = error instanceof Error ? error.message : String(error);

      if (retryCount >= this.maxAttempts) {
        await this.sendToDeadLetter(event, message);
        await this.consumerRegistry.dispatch({
          eventId: event.eventId,
          topic: topicName,
          payload:
            typeof event.payload === 'object' && event.payload !== null
              ? (event.payload as Record<string, unknown>)
              : { value: event.payload },
          correlationId: event.correlationId,
          tenantId: (event as { tenantId?: string }).tenantId,
          regionId: (event as { regionId?: string }).regionId,
        });

        this.metrics.inc('outbox_processed_total');
        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            retryCount,
            lastError: message,
            deadLetteredAt: new Date(),
          },
        });
        return;
      }

      const nextRetryAt = new Date(
        Date.now() + this.calculateBackoff(retryCount - 1),
      );
      await this.consumerRegistry.dispatch({
        eventId: event.eventId,
        topic: topicName,
        payload:
          typeof event.payload === 'object' && event.payload !== null
            ? (event.payload as Record<string, unknown>)
            : { value: event.payload },
        correlationId: event.correlationId,
        tenantId: (event as { tenantId?: string }).tenantId,
        regionId: (event as { regionId?: string }).regionId,
      });

      this.metrics.inc('outbox_processed_total');
      await this.prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          retryCount,
          lastError: message,
          nextRetryAt,
        },
      });

      this.metrics.setGauge(
        'outbox_lag_seconds',
        Math.max(
          0,
          (Date.now() - new Date(event['createdAt'] ?? Date.now()).getTime()) /
            1000,
        ),
      );
      this.logger.warn(
        `Outbox event retry scheduled event=${event.id} retryCount=${retryCount} nextRetryAt=${nextRetryAt.toISOString()} reason=${message}`,
      );
    }
  }

  private async sendToDeadLetter(
    event: OutboxEventRecord,
    errorMessage: string,
  ): Promise<void> {
    await this.prisma.outboxDeadLetter.create({
      data: {
        outboxEventId: event.id,
        aggregateId: event.aggregateId,
        type: event.type,
        version: event.version ?? 'v1',
        payload:
          typeof event.payload === 'object' && event.payload !== null
            ? event.payload
            : { value: event.payload },
        errorMessage,
      },
    });

    await this.kafkaPublisher.publishDeadLetter(
      {
        topic: `${event.type}.${event.version ?? 'v1'}`,
        key: event.aggregateId,
        payload:
          typeof event.payload === 'object' && event.payload !== null
            ? (event.payload as Record<string, unknown>)
            : { value: event.payload },
        version: event.version ?? 'v1',
        correlationId: event.correlationId,
        regionId: event.regionId,
      },
      errorMessage,
    );
  }

  private calculateBackoff(attempt: number): number {
    return Math.min(this.maxDelayMs, this.baseDelayMs * 2 ** attempt);
  }
}
