import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@airbnb-clone/database';

const datasourceUrl =
  process.env.PAYMENTS_DATABASE_URL ?? process.env.DATABASE_URL;

@Injectable()
export class PrismaIdempotencyClient
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      datasources: datasourceUrl ? { db: { url: datasourceUrl } } : undefined,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
