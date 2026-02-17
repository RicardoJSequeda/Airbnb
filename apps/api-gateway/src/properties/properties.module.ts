import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PublicPropertiesController } from './public-properties.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [PropertiesController, PublicPropertiesController],
  providers: [PropertiesService, PrismaService],
})
export class PropertiesModule {}