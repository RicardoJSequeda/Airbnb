import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { PrismaService } from '../../common/prisma.service';

interface StoredResponse {
  responseCode: number;
  responseBody: unknown;
}

interface IdempotencyRecordEntity {
  id: string;
  scopeKey: string;
  method: string;
  path: string;
  idempotencyKey: string;
  payloadHash: string;
  responseCode: number | null;
  responseBody: unknown;
  expiresAt: Date;
}

@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  hashPayload(payload: unknown): string {
    const normalized = JSON.stringify(payload ?? {});
    return createHash('sha256').update(normalized).digest('hex');
  }

  buildScope(method: string, path: string, key: string): string {
    return `${method.toUpperCase()}:${path}:${key}`;
  }

  async reserve(params: {
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
        return 'payload_mismatch';
      }

      if (existing.responseCode !== null) {
        return {
          responseCode: existing.responseCode,
          responseBody: existing.responseBody,
        };
      }

      return 'duplicate_pending';
    }

    await model.create({
      data: {
        scopeKey,
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
    method: string;
    path: string;
    key: string;
    responseCode: number;
    responseBody: unknown;
  }): Promise<void> {
    const scopeKey = this.buildScope(params.method, params.path, params.key);

    const prismaAny = this.prisma as unknown as {
      idempotencyRecord?: {
        updateMany: (args: unknown) => Promise<unknown>;
      };
    };

    await prismaAny.idempotencyRecord?.updateMany({
      where: { scopeKey },
      data: {
        responseCode: params.responseCode,
        responseBody: params.responseBody as object,
      },
    });
  }
}
