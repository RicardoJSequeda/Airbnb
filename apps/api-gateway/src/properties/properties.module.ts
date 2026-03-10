import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PublicPropertiesController } from './public-properties.controller';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { PrismaPropertiesRepository } from './infra/prisma-properties.repository';
import { CreatePropertyUseCase } from './application/create-property.usecase';
import { UpdatePropertyUseCase } from './application/update-property.usecase';
import { DeletePropertyUseCase } from './application/delete-property.usecase';
import { PublishPropertyUseCase } from './application/publish-property.usecase';
import { ListPropertiesQuery } from './application/queries/list-properties.query';
import { GetPropertyQuery } from './application/queries/get-property.query';
import { ListPublicPropertiesQuery } from './application/queries/list-public-properties.query';
import { GetPublicPropertyQuery } from './application/queries/get-public-property.query';

@Module({
  controllers: [PropertiesController, PublicPropertiesController],
  providers: [
    PrismaService,
    RedisService,
    PrismaPropertiesRepository,
    {
      provide: 'IPropertiesRepository',
      useExisting: PrismaPropertiesRepository,
    },
    CreatePropertyUseCase,
    UpdatePropertyUseCase,
    DeletePropertyUseCase,
    PublishPropertyUseCase,
    ListPropertiesQuery,
    GetPropertyQuery,
    ListPublicPropertiesQuery,
    GetPublicPropertyQuery,
    PropertiesService,
    SubscriptionGuard,
  ],
  exports: [PropertiesService],
})
export class PropertiesModule {}
