 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaIdempotencyClient } from './infrastructure/prisma-idempotency.client';
import { MetricsService } from '../observability/metrics.service';

import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../common/prisma.service';
 main

interface StoredResponse {
  responseCode: number;
  responseBody: unknown;
}

interface IdempotencyRecordEntity {
  id: string;
  scopeKey: string;
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
  actorId: string;
  operation: string;

 main
  method: string;
  path: string;
  idempotencyKey: string;
  payloadHash: string;
  responseCode: number | null;
  responseBody: unknown;
  expiresAt: Date;
}

@Injectable()
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
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

export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}
 main

  hashPayload(payload: unknown): string {
    const normalized = JSON.stringify(payload ?? {});
    return createHash('sha256').update(normalized).digest('hex');
  }

 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
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

  buildScope(method: string, path: string, key: string): string {
    return `${method.toUpperCase()}:${path}:${key}`;
  }

  async reserve(params: {
 main
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
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
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

    const scopeKey = this.buildScope(params.method, params.path, params.key);

    const prismaAny = this.prisma as unknown as {
      idempotencyRecord?: {
        findUnique: (args: unknown) => Promise<IdempotencyRecordEntity | null>;
        create: (args: unknown) => Promise<IdempotencyRecordEntity>;
      };
    };

    const model = prismaAny.idempotencyRecord;
    if (!model?.findUnique || !model?.create) {
      return 'reserved';
    }

    const existing = await model.findUnique({ where: { scopeKey } });

    if (existing && existing.expiresAt > now) {
      if (existing.payloadHash !== params.payloadHash) {
 main
        return 'payload_mismatch';
      }

      if (existing.responseCode !== null) {
        return {
          responseCode: existing.responseCode,
          responseBody: existing.responseBody,
        };
      }

 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
      this.metrics.inc('idempotency_duplicates_total');
 main
      return 'duplicate_pending';
    }

    await model.create({
      data: {
        scopeKey,
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
        actorId: params.actorId,
        operation: params.operation,
        tenantId: params.tenantId ?? 'default',
        regionId: params.regionId ?? 'global',
 main
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
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
    actorId: string;
> main
    method: string;
    path: string;
    key: string;
    responseCode: number;
    responseBody: unknown;
  }): Promise<void> {
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
    const scopeKey = this.buildScope(
      params.method,
      params.path,
      params.key,
      params.actorId,
    );

    await this.prisma.idempotencyRecord.updateMany({

    const scopeKey = this.buildScope(params.method, params.path, params.key);

    const prismaAny = this.prisma as unknown as {
      idempotencyRecord?: {
        updateMany: (args: unknown) => Promise<unknown>;
      };
    };

    await prismaAny.idempotencyRecord?.updateMany({
 main
      where: { scopeKey },
      data: {
        responseCode: params.responseCode,
        responseBody: params.responseBody as object,
      },
    });
  }
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5

  private async cleanupExpired(): Promise<void> {
    const deleted = await this.prisma.idempotencyRecord.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    if (deleted.count > 0) {
      this.logger.debug(`Expired idempotency records cleaned=${deleted.count}`);
    }
  }
 main
}
