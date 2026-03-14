import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePropertyUseCase } from './application/create-property.usecase';
import { UpdatePropertyUseCase } from './application/update-property.usecase';
import { DeletePropertyUseCase } from './application/delete-property.usecase';
import { PublishPropertyUseCase } from './application/publish-property.usecase';
import { ListPropertiesQuery } from './application/queries/list-properties.query';
import { GetPropertyQuery } from './application/queries/get-property.query';
import { ListPublicPropertiesQuery } from './application/queries/list-public-properties.query';
import { GetPublicPropertyQuery } from './application/queries/get-public-property.query';
import {
  ApplicationNotFoundError,
  ApplicationForbiddenError,
} from './application/errors';
import type { CreatePropertyDto } from './dto/create-property.dto';
import type { UpdatePropertyDto } from './dto/update-property.dto';
import { RedisService } from '../common/redis.service';

@Injectable()
export class PropertiesService {
  constructor(
    private readonly createPropertyUseCase: CreatePropertyUseCase,
    private readonly updatePropertyUseCase: UpdatePropertyUseCase,
    private readonly deletePropertyUseCase: DeletePropertyUseCase,
    private readonly publishPropertyUseCase: PublishPropertyUseCase,
    private readonly listPropertiesQuery: ListPropertiesQuery,
    private readonly getPropertyQuery: GetPropertyQuery,
    private readonly listPublicPropertiesQuery: ListPublicPropertiesQuery,
    private readonly getPublicPropertyQuery: GetPublicPropertyQuery,
    private readonly redis: RedisService,
  ) {}

  async create(
    createPropertyDto: CreatePropertyDto,
    hostId: string,
    organizationId: string,
  ) {
    try {
      const { property } = await this.createPropertyUseCase.execute({
        dto: createPropertyDto,
        hostId,
        organizationId,
      });
      await this.bumpOrgPropertiesVersion(organizationId);
      return property;
    } catch (err) {
      this.mapError(err);
    }
  }

  async findAll(filters?: {
    city?: string;
    country?: string;
    propertyType?: string;
    organizationId?: string | null;
  }) {
    return this.listPropertiesQuery.execute(filters);
  }

  async findOne(id: string, organizationId?: string | null) {
    try {
      return await this.getPropertyQuery.execute(id, organizationId);
    } catch (err) {
      this.mapError(err);
    }
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    userId: string,
    organizationId?: string | null,
  ) {
    try {
      const { property } = await this.updatePropertyUseCase.execute({
        id,
        dto: updatePropertyDto,
        userId,
        organizationId,
      });
      await this.bumpOrgPropertiesVersion(organizationId ?? undefined);
      return property;
    } catch (err) {
      this.mapError(err);
    }
  }

  async remove(id: string, userId: string, organizationId?: string | null) {
    try {
      await this.deletePropertyUseCase.execute({
        id,
        userId,
        organizationId,
      });
      await this.bumpOrgPropertiesVersion(organizationId ?? undefined);
    } catch (err) {
      this.mapError(err);
    }
  }

  async publish(id: string, userId: string, organizationId?: string | null) {
    try {
      const { property } = await this.publishPropertyUseCase.execute({
        id,
        userId,
        organizationId,
      });
      await this.bumpOrgPropertiesVersion(organizationId ?? undefined);
      await this.bumpPublicPropertiesVersion();
      return property;
    } catch (err) {
      this.mapError(err);
    }
  }

  async findAllPublic(filters?: {
    city?: string;
    country?: string;
    propertyType?: string;
  }) {
    return this.listPublicPropertiesQuery.execute(filters);
  }

  async findOnePublic(id: string) {
    return this.getPublicPropertyQuery.execute(id);
  }

  private async bumpOrgPropertiesVersion(
    organizationId?: string,
  ): Promise<void> {
    if (!organizationId || !this.redis.isAvailable()) return;
    await this.redis.incr(`properties:list:version:${organizationId}`);
  }

  private async bumpPublicPropertiesVersion(): Promise<void> {
    if (!this.redis.isAvailable()) return;
    await this.redis.incr('public:properties:version');
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
      typeof err === 'string'
        ? err
        : 'Unexpected error while handling property',
    );
  }
}
