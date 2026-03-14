/**
 * Query: listar propiedades públicas (marketplace).
 * Si falla la BD, devuelve [].
 */

import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IPropertiesRepository } from '../../domain/ports/properties.repository';
import type { ListPublicPropertiesFilters } from '../../domain/ports/properties.repository';
import { RedisService } from '../../../common/redis.service';

const CACHE_TTL = 60;
const PUBLIC_VERSION_KEY = 'public:properties:version';

@Injectable()
export class ListPublicPropertiesQuery {
  private readonly logger = new Logger(ListPublicPropertiesQuery.name);

  constructor(
    @Inject('IPropertiesRepository')
    private readonly repository: IPropertiesRepository,
    private readonly redis: RedisService,
  ) {}

  async execute(
    filters?: ListPublicPropertiesFilters,
  ): Promise<Record<string, unknown>[]> {
    try {
      const version = this.redis.isAvailable()
        ? String((await this.redis.get(PUBLIC_VERSION_KEY)) ?? '0')
        : '0';
      const cacheKey = `public:properties:${version}:${filters?.city ?? ''}:${filters?.country ?? ''}:${filters?.propertyType ?? ''}`;

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
