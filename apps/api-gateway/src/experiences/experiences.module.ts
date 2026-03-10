import { Module } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import {
  ExperiencesController,
  PublicExperiencesController,
} from './experiences.controller';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { PrismaExperiencesRepository } from './infra/prisma-experiences.repository';
import { CreateExperienceUseCase } from './application/create-experience.usecase';
import { UpdateExperienceUseCase } from './application/update-experience.usecase';
import { DeleteExperienceUseCase } from './application/delete-experience.usecase';
import { PublishExperienceUseCase } from './application/publish-experience.usecase';
import { ListExperiencesQuery } from './application/queries/list-experiences.query';
import { GetExperienceQuery } from './application/queries/get-experience.query';
import { ListPublicExperiencesQuery } from './application/queries/list-public-experiences.query';
import { GetPublicExperienceQuery } from './application/queries/get-public-experience.query';

@Module({
  controllers: [ExperiencesController, PublicExperiencesController],
  providers: [
    PrismaService,
    RedisService,
    PrismaExperiencesRepository,
    {
      provide: 'IExperiencesRepository',
      useExisting: PrismaExperiencesRepository,
    },
    CreateExperienceUseCase,
    UpdateExperienceUseCase,
    DeleteExperienceUseCase,
    PublishExperienceUseCase,
    ListExperiencesQuery,
    GetExperienceQuery,
    ListPublicExperiencesQuery,
    GetPublicExperienceQuery,
    ExperiencesService,
  ],
  exports: [ExperiencesService],
})
export class ExperiencesModule {}
