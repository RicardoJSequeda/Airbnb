import { Module } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { ExperiencesController, PublicExperiencesController } from './experiences.controller';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';

@Module({
  controllers: [ExperiencesController, PublicExperiencesController],
  providers: [ExperiencesService, PrismaService, RedisService],
  exports: [ExperiencesService],
})
export class ExperiencesModule {}
