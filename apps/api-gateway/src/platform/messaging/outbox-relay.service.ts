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
  payload: unknown;
}

@Injectable()
export class OutboxRelayService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxRelayService.name);
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private readonly kafkaPublisher: KafkaPublisherService,
    private readonly configService: ConfigService,
  ) {}

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

  async flushPendingEvents(limit = 50): Promise<void> {
    const prismaAny = this.prisma as unknown as {
      outboxEvent?: {
        findMany: (args: unknown) => Promise<OutboxEventRecord[]>;
        update: (args: unknown) => Promise<unknown>;
      };
    };

    if (!prismaAny.outboxEvent?.findMany || !prismaAny.outboxEvent?.update) {
      this.logger.debug('OutboxEvent model not available in Prisma client');
      return;
    }

    const pendingEvents = await prismaAny.outboxEvent.findMany({
      where: { processedAt: null },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    for (const event of pendingEvents) {
      try {
        await this.kafkaPublisher.publish({
          topic: event.type,
          key: event.aggregateId,
          payload:
            typeof event.payload === 'object' && event.payload !== null
              ? (event.payload as Record<string, unknown>)
              : { value: event.payload },
        });

        await prismaAny.outboxEvent.update({
          where: { id: event.id },
          data: { processedAt: new Date() },
        });
      } catch (error) {
        this.logger.warn(
          `Failed publishing outbox event ${event.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }
}
