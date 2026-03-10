import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateExperienceUseCase } from './application/create-experience.usecase';
import { UpdateExperienceUseCase } from './application/update-experience.usecase';
import { DeleteExperienceUseCase } from './application/delete-experience.usecase';
import { PublishExperienceUseCase } from './application/publish-experience.usecase';
import { ListExperiencesQuery } from './application/queries/list-experiences.query';
import { GetExperienceQuery } from './application/queries/get-experience.query';
import { ListPublicExperiencesQuery } from './application/queries/list-public-experiences.query';
import { GetPublicExperienceQuery } from './application/queries/get-public-experience.query';
import {
  ApplicationNotFoundError,
  ApplicationForbiddenError,
} from './application/errors';
import type { CreateExperienceDto } from './dto/create-experience.dto';
import type { UpdateExperienceDto } from './dto/update-experience.dto';

@Injectable()
export class ExperiencesService {
  constructor(
    private readonly createExperienceUseCase: CreateExperienceUseCase,
    private readonly updateExperienceUseCase: UpdateExperienceUseCase,
    private readonly deleteExperienceUseCase: DeleteExperienceUseCase,
    private readonly publishExperienceUseCase: PublishExperienceUseCase,
    private readonly listExperiencesQuery: ListExperiencesQuery,
    private readonly getExperienceQuery: GetExperienceQuery,
    private readonly listPublicExperiencesQuery: ListPublicExperiencesQuery,
    private readonly getPublicExperienceQuery: GetPublicExperienceQuery,
  ) {}

  async create(
    createExperienceDto: CreateExperienceDto,
    hostId: string,
    organizationId: string,
  ) {
    try {
      const { experience } = await this.createExperienceUseCase.execute({
        dto: createExperienceDto,
        hostId,
        organizationId,
      });
      return experience;
    } catch (err) {
      this.mapError(err);
    }
  }

  async findAll(filters?: {
    city?: string;
    country?: string;
    category?: string;
    organizationId?: string | null;
    minParticipants?: number;
  }) {
    return this.listExperiencesQuery.execute(filters);
  }

  async findOne(id: string, organizationId?: string | null) {
    try {
      return await this.getExperienceQuery.execute(id, organizationId);
    } catch (err) {
      this.mapError(err);
    }
  }

  async update(
    id: string,
    updateExperienceDto: UpdateExperienceDto,
    hostId: string,
    organizationId: string,
  ) {
    try {
      const { experience } = await this.updateExperienceUseCase.execute({
        id,
        dto: updateExperienceDto,
        hostId,
        organizationId,
      });
      return experience;
    } catch (err) {
      this.mapError(err);
    }
  }

  async remove(id: string, hostId: string, organizationId: string) {
    try {
      await this.deleteExperienceUseCase.execute({
        id,
        hostId,
        organizationId,
      });
    } catch (err) {
      this.mapError(err);
    }
  }

  async publish(id: string, hostId: string, organizationId: string) {
    try {
      const { experience } = await this.publishExperienceUseCase.execute({
        id,
        hostId,
        organizationId,
      });
      return experience;
    } catch (err) {
      this.mapError(err);
    }
  }

  async findAllPublic(filters?: {
    city?: string;
    country?: string;
    category?: string;
    minParticipants?: number;
    listingType?: 'service' | 'experience';
  }) {
    return this.listPublicExperiencesQuery.execute(filters);
  }

  async findOnePublic(id: string) {
    return this.getPublicExperienceQuery.execute(id);
  }

  private mapError(err: unknown): never {
    if (err instanceof ApplicationNotFoundError) {
      throw new NotFoundException(err.message);
    }
    if (err instanceof ApplicationForbiddenError) {
      throw new ForbiddenException(err.message);
    }
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(
      typeof err === 'string' ? err : 'Unexpected error while handling experience',
    );
  }
}
