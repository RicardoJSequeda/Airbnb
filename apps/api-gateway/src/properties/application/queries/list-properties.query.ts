/**
 * Query: listar propiedades (dashboard).
 */

import { Inject, Injectable } from '@nestjs/common';
import type { IPropertiesRepository } from '../../domain/ports/properties.repository';
import type { ListPropertiesFilters } from '../../domain/ports/properties.repository';
import { RedisService } from '../../../common/redis.service';

const CACHE_TTL = 60;

function orgVersionKey(orgId: string): string {
  return `properties:list:version:${orgId}`;
}

@Injectable()
export class ListPropertiesQuery {
  constructor(
    @Inject('IPropertiesRepository')
    private readonly repository: IPropertiesRepository,
    private readonly redis: RedisService,
  ) {}

  async execute(
    filters?: ListPropertiesFilters,
  ): Promise<Record<string, unknown>[]> {
    const orgId = filters?.organizationId ?? '';
    const version = this.redis.isAvailable()
      ? String((await this.redis.get(orgVersionKey(orgId))) ?? '0')
      : '0';
    const cacheKey = `properties:list:${orgId}:${version}:${filters?.city ?? ''}:${filters?.country ?? ''}:${filters?.propertyType ?? ''}:${filters?.status ?? 'ALL'}`;

    if (this.redis.isAvailable()) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached) as Record<string, unknown>[];
        } catch {
          /* invalid cache */
        }
      }
    }

    const result = await this.repository.findMany(filters ?? {});

    if (this.redis.isAvailable()) {
      await this.redis.set(cacheKey, JSON.stringify(result), CACHE_TTL);
    }

    return result;
  }
}
