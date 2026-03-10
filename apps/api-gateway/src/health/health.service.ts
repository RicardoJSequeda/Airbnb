import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { PrismaOutboxClient } from '../platform/messaging/infrastructure/prisma-outbox.client';
import { RedisService } from '../common/redis.service';
import { KafkaPublisherService } from '../platform/messaging/kafka.publisher.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersDb: PrismaOutboxClient,
    private readonly redis: RedisService,
    private readonly kafka: KafkaPublisherService,
  ) {}

  async health() {
    const [bookings, payments, users, listings, kafka, redis] =
      await Promise.all([
        this.pingDb(this.prisma),
        this.pingDb(this.prisma),
        this.pingDb(this.usersDb),
        this.pingDb(this.prisma),
        this.kafka.checkHealth(),
        this.pingRedis(),
      ]);

    return {
      status:
        bookings && payments && users && listings && kafka && redis
          ? 'OK'
          : 'DEGRADED',
      timestamp: new Date().toISOString(),
      checks: { bookings, payments, users, listings, kafka, redis },
    };
  }

  async ready() {
    const state = await this.health();
    return { ready: state.status === 'OK', ...state };
  }

  live() {
    return { live: true, timestamp: new Date().toISOString() };
  }

  private async pingDb(client: {
    $queryRaw: (q: TemplateStringsArray) => Promise<unknown>;
  }) {
    try {
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  private async pingRedis(): Promise<boolean> {
    try {
      const client = this.redis.getClient();
      if (!client) return false;
      const pong = await client.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }
}
