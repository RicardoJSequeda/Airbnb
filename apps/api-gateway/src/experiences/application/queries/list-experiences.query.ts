/**
 * Query: listar experiencias (dashboard).
 */

import { Inject, Injectable } from '@nestjs/common';
import type { IExperiencesRepository } from '../../domain/ports/experiences.repository';
import type { ListExperiencesFilters } from '../../domain/ports/experiences.repository';
import { RedisService } from '../../../common/redis.service';

const CACHE_TTL = 60;

@Injectable()
export class ListExperiencesQuery {
  constructor(
    @Inject('IExperiencesRepository')
    private readonly repository: IExperiencesRepository,
    private readonly redis: RedisService,
  ) {}

  async execute(filters?: ListExperiencesFilters): Promise<Record<string, unknown>[]> {
    const orgId = filters?.organizationId ?? '';
    const cacheKey = `experiences:list:${orgId}:${filters?.city ?? ''}:${filters?.country ?? ''}:${filters?.category ?? ''}`;

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
