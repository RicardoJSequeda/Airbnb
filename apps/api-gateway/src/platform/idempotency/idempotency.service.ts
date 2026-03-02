import { Injectable } from '@nestjs/common';
import { RedisService } from '../../common/redis.service';

@Injectable()
export class IdempotencyService {
  private readonly fallback = new Map<string, number>();

  constructor(private readonly redisService: RedisService) {}

  private buildScope(method: string, path: string, key: string): string {
    return `idempotency:${method.toUpperCase()}:${path}:${key}`;
  }

  async register(
    method: string,
    path: string,
    key: string,
    ttlSeconds: number,
  ): Promise<boolean> {
    const scope = this.buildScope(method, path, key);

    if (this.redisService.isAvailable()) {
      return this.redisService.trySetNx(scope, String(Date.now()), ttlSeconds);
    }

    const now = Date.now();
    const existing = this.fallback.get(scope);
    if (existing && existing > now) {
      return false;
    }

    this.fallback.set(scope, now + ttlSeconds * 1000);
    return true;
  }
}
