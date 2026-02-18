import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async check(): Promise<{
    status: 'OK' | 'DEGRADED';
    timestamp: string;
    db: 'ok' | 'error';
    stripe: 'ok' | 'missing';
  }> {
    const timestamp = new Date().toISOString();
    let db: 'ok' | 'error' = 'error';
    let stripe: 'ok' | 'missing' = 'missing';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = 'ok';
    } catch {
      db = 'error';
    }

    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    stripe = stripeKey && stripeKey.trim().length > 0 ? 'ok' : 'missing';

    const status = db === 'ok' ? 'OK' : 'DEGRADED';
    return { status, timestamp, db, stripe };
  }
}
