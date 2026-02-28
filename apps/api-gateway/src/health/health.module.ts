import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { DiagnosticController } from './diagnostic.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [HealthController, DiagnosticController],
  providers: [HealthService, PrismaService],
})
export class HealthModule {}
