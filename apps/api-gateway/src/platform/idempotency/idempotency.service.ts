import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaIdempotencyClient } from './infrastructure/prisma-idempotency.client';
import { MetricsService } from '../observability/metrics.service';

interface StoredResponse {
  responseCode: number;
  responseBody: unknown;
}

interface IdempotencyRecordEntity {
  id: string;
  scopeKey: string;
  actorId: string;
  operation: string;
  method: string;
  path: string;
  idempotencyKey: string;
  payloadHash: string;
  responseCode: number | null;
  responseBody: unknown;
  expiresAt: Date;
}

@Injectable()
export class IdempotencyService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(IdempotencyService.name);
  private cleanupTimer?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaIdempotencyClient,
    private readonly metrics: MetricsService,
  ) {}

  onModuleInit(): void {
    const enabled =
      process.env.PROCESS_ROLE === 'worker' &&
      process.env.IDEMPOTENCY_CLEANUP_ENABLED !== 'false';
    if (!enabled) return;

    this.cleanupTimer = setInterval(() => {
      void this.cleanupExpired();
    }, 60_000);
  }

  onModuleDestroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  hashPayload(payload: unknown): string {
    const normalized = JSON.stringify(payload ?? {});
    return createHash('sha256').update(normalized).digest('hex');
  }

  buildScope(
    method: string,
    path: string,
    key: string,
    actorId: string,
  ): string {
    return `${method.toUpperCase()}:${path}:${actorId}:${key}`;
  }

  async reserve(params: {
    actorId: string;
    operation: string;
    tenantId?: string;
    regionId?: string;
    method: string;
    path: string;
    key: string;
    payloadHash: string;
    ttlSeconds: number;
  }): Promise<
    'reserved' | 'payload_mismatch' | 'duplicate_pending' | StoredResponse
  > {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + params.ttlSeconds * 1000);
    const scopeKey = this.buildScope(
      params.method,
      params.path,
      params.key,
      params.actorId,
    );

    const model = this.prisma.idempotencyRecord;

    const existing = (await model.findUnique({
      where: { scopeKey },
    })) as IdempotencyRecordEntity | null;

    if (existing && existing.expiresAt > now) {
      if (existing.payloadHash !== params.payloadHash) {
        this.metrics.inc('idempotency_duplicates_total');
        return 'payload_mismatch';
      }

      if (existing.responseCode !== null) {
        return {
          responseCode: existing.responseCode,
          responseBody: existing.responseBody,
        };
      }

      this.metrics.inc('idempotency_duplicates_total');
      return 'duplicate_pending';
    }

    await model.create({
      data: {
        scopeKey,
        actorId: params.actorId,
        operation: params.operation,
        tenantId: params.tenantId ?? 'default',
        regionId: params.regionId ?? 'global',
        method: params.method.toUpperCase(),
        path: params.path,
        idempotencyKey: params.key,
        payloadHash: params.payloadHash,
        expiresAt,
      },
    });

    return 'reserved';
  }

  async saveResponse(params: {
    actorId: string;
    method: string;
    path: string;
    key: string;
    responseCode: number;
    responseBody: unknown;
  }): Promise<void> {
    const scopeKey = this.buildScope(
      params.method,
      params.path,
      params.key,
      params.actorId,
    );

    await this.prisma.idempotencyRecord.updateMany({
      where: { scopeKey },
      data: {
        responseCode: params.responseCode,
        responseBody: params.responseBody as object,
      },
    });
  }

  private async cleanupExpired(): Promise<void> {
    const deleted = await this.prisma.idempotencyRecord.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    if (deleted.count > 0) {
      this.logger.debug(`Expired idempotency records cleaned=${deleted.count}`);
    }
  }
}
