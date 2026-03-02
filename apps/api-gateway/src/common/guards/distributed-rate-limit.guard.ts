import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
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

    const client = this.redis.getClient();
    if (!client) {
      return true;
    }

    const actor = request.user?.userId ?? request.ip ?? 'anonymous';
    const endpoint = `${request.method}:${request.path}`;
    const key = `rate:${actor}:${endpoint}`;
    const now = Date.now();

    const script = `
      local key = KEYS[1]
      local now = tonumber(ARGV[1])
      local windowStart = tonumber(ARGV[2])
      local ttl = tonumber(ARGV[3])
      local member = ARGV[4]

      redis.call('ZREMRANGEBYSCORE', key, 0, windowStart)
      redis.call('ZADD', key, now, member)
      local count = redis.call('ZCARD', key)
      redis.call('PEXPIRE', key, ttl)
      return count
    `;

    const count = await client.eval(
      script,
      1,
      key,
      now,
      now - this.windowMs,
      this.windowMs,
      `${now}-${Math.random()}`,
    );

    if (Number(count) > this.limit) {
      throw new HttpException(
        'Too many requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
