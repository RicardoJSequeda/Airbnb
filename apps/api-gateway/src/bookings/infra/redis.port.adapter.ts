/**
 * Adaptador que implementa IRedisPort delegando en RedisService.
 * La capa de aplicación no importa cliente Redis.
 */

import type { IRedisPort } from '../domain/ports/redis.port';
import { RedisService } from '../../common/redis.service';

export class RedisPortAdapter implements IRedisPort {
  constructor(private readonly redisService: RedisService) {}

  isAvailable(): boolean {
    return this.redisService.isAvailable();
  }

  async incr(key: string): Promise<number> {
    return this.redisService.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    return this.redisService.expire(key, seconds);
  }

  async get(key: string): Promise<string | null> {
    return this.redisService.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    return this.redisService.set(key, value, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    return this.redisService.del(key);
  }

  async trySetNx(
    key: string,
    value: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    return this.redisService.trySetNx(key, value, ttlSeconds);
  }
}
