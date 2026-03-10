/**
 * Query: listar experiencias públicas (marketplace).
 * Si falla la BD, devuelve [].
 */

import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IExperiencesRepository } from '../../domain/ports/experiences.repository';
import type { ListPublicExperiencesFilters } from '../../domain/ports/experiences.repository';
import { RedisService } from '../../../common/redis.service';

const CACHE_TTL = 60;

@Injectable()
export class ListPublicExperiencesQuery {
  private readonly logger = new Logger(ListPublicExperiencesQuery.name);

  constructor(
    @Inject('IExperiencesRepository')
    private readonly repository: IExperiencesRepository,
    private readonly redis: RedisService,
  ) {}

  async execute(
    filters?: ListPublicExperiencesFilters,
  ): Promise<Record<string, unknown>[]> {
    try {
      const cacheKey = `public:experiences:${filters?.city ?? ''}:${filters?.country ?? ''}:${filters?.category ?? ''}:${filters?.listingType ?? ''}`;

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

      const result = await this.repository.findManyPublic(filters ?? {});

      if (this.redis.isAvailable()) {
        await this.redis.set(cacheKey, JSON.stringify(result), CACHE_TTL);
      }

      return result;
    } catch (err) {
      this.logger.warn(
        `findAllPublic failed (returning []): ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    }
  }
}
