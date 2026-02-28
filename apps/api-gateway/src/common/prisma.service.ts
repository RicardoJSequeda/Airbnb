import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@airbnb-clone/database';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const isProduction = configService.get('NODE_ENV') === 'production';
    super({
      log: isProduction
        ? ['error', 'warn']
        : ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    const isProduction = process.env.NODE_ENV === 'production';
    try {
      await this.$connect();
    } catch (err) {
      if (isProduction) {
        throw err;
      }
      this.logger.warn(
        `No se pudo conectar a la BD (el servidor arranca igual; las rutas públicas devolverán datos vacíos): ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
