import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma.service';
import { KafkaPublisherService } from './kafka.publisher.service';

interface OutboxEventRecord {
  id: string;
  aggregateId: string;
  type: string;
  version?: string;
  payload: unknown;
  correlationId?: string;
  attempts?: number;
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
    private readonly prisma: PrismaService,
    private readonly kafkaPublisher: KafkaPublisherService,
    private readonly configService: ConfigService,
  ) {
    this.batchSize = Number(configService.get('OUTBOX_RELAY_BATCH_SIZE') ?? 50);
    this.maxAttempts = Number(configService.get('OUTBOX_MAX_ATTEMPTS') ?? 8);
    this.baseDelayMs = Number(configService.get('OUTBOX_RETRY_BASE_MS') ?? 500);
    this.maxDelayMs = Number(configService.get('OUTBOX_RETRY_MAX_MS') ?? 60000);
  }

  onModuleInit(): void {
    const enabled =
      this.configService.get<string>('OUTBOX_RELAY_ENABLED') !== 'false';

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
        const batch = await this.fetchBatch(this.batchSize);
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
    };
  }

  private async fetchBatch(limit: number): Promise<OutboxEventRecord[]> {
    const outbox = this.prismaOutbox.outboxEvent;
    if (!outbox?.findMany) {
      this.logger.debug('OutboxEvent model not available in Prisma client');
      return [];
    }

    return outbox.findMany({
      where: {
        processedAt: null,
        deadLetteredAt: null,
        attempts: { lt: this.maxAttempts },
        OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: new Date() } }],
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  private async processEvent(event: OutboxEventRecord): Promise<void> {
    const outbox = this.prismaOutbox.outboxEvent;
    if (!outbox?.update) {
      return;
    }

    try {
      await this.kafkaPublisher.publish({
        topic: event.type,
        key: event.aggregateId,
        version: event.version ?? 'v1',
        correlationId: event.correlationId,
        payload:
          typeof event.payload === 'object' && event.payload !== null
            ? (event.payload as Record<string, unknown>)
            : { value: event.payload },
      });

      await outbox.update({
        where: { id: event.id },
        data: {
          processedAt: new Date(),
          lastError: null,
        },
      });
    } catch (error) {
      const attempts = (event.attempts ?? 0) + 1;
      const message = error instanceof Error ? error.message : String(error);

      if (attempts >= this.maxAttempts) {
        await this.sendToDeadLetter(event, message);
        await outbox.update({
          where: { id: event.id },
          data: {
            attempts,
            lastError: message,
            deadLetteredAt: new Date(),
          },
        });
        return;
      }

      const nextRetryAt = new Date(
        Date.now() + this.calculateBackoff(attempts - 1),
      );
      await outbox.update({
        where: { id: event.id },
        data: {
          attempts,
          lastError: message,
          nextRetryAt,
        },
      });

      this.logger.warn(
        `Outbox event retry scheduled event=${event.id} attempts=${attempts} nextRetryAt=${nextRetryAt.toISOString()} reason=${message}`,
      );
    }
  }

  private async sendToDeadLetter(
    event: OutboxEventRecord,
    errorMessage: string,
  ): Promise<void> {
    const deadLetter = this.prismaOutbox.outboxDeadLetter;
    if (!deadLetter?.create) {
      this.logger.error(
        `Outbox event reached max attempts without dead-letter model: ${event.id}`,
      );
      return;
    }

    await deadLetter.create({
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
  }

  private calculateBackoff(attempt: number): number {
    return Math.min(this.maxDelayMs, this.baseDelayMs * 2 ** attempt);
  }
}
