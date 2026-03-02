import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RedisService } from '../redis.service';

@Injectable()
export class DistributedRateLimitGuard implements CanActivate {
  private readonly limit = 100;
  private readonly windowMs = 60_000;

  constructor(private readonly redis: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: { userId?: string };
      path: string;
      method: string;
      ip?: string;
    }>();

    if (!this.redis.isAvailable()) {
      return true;
    }

    const actor = request.user?.userId ?? request.ip ?? 'anonymous';
    const endpoint = `${request.method}:${request.path}`;
    const key = `rate:${actor}:${endpoint}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    const client = this.redis.getClient();
    if (!client) return true;

    await client.zremrangebyscore(key, 0, windowStart);
    await client.zadd(key, now, `${now}-${Math.random()}`);
    const current = await client.zcard(key);
    await client.pexpire(key, this.windowMs);

    if (current > this.limit) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
