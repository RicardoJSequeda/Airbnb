import {
  ForbiddenException,
  Injectable,
  Logger,
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
import { MetricsService } from '../platform/observability/metrics.service';

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

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
    private readonly metrics: MetricsService,
  ) {}

  async createDraft(hostId: string, organizationId: string) {
    const startedAt = Date.now();
    const dto: CreatePropertyDto = {
      title: 'Borrador de alojamiento',
      description: 'Borrador en progreso',
      price: 0,
      currency: 'COP',
      maxGuests: 1,
      bedrooms: 1,
      bathrooms: 1,
      propertyType: 'casa',
      address: 'Pendiente',
      city: 'Pendiente',
      country: 'Colombia',
      latitude: 0,
      longitude: 0,
      amenities: [],
      images: [],
    };

    try {
      const result = await this.create(dto, hostId, organizationId);
      this.markOperation('create_draft', startedAt, true);
      return result;
    } catch (err) {
      this.markOperation('create_draft', startedAt, false);
      throw err;
    }
  }

  async create(
    createPropertyDto: CreatePropertyDto,
    hostId: string,
    organizationId: string,
  ) {
    const startedAt = Date.now();
    try {
      const { property } = await this.createPropertyUseCase.execute({
        dto: createPropertyDto,
        hostId,
        organizationId,
      });
      await this.bumpOrgPropertiesVersion(organizationId);
      this.markOperation('create', startedAt, true);
      return property;
    } catch (err) {
      this.markOperation('create', startedAt, false);
      this.mapError(err);
    }
  }

  async findAll(filters?: {
    city?: string;
    country?: string;
    propertyType?: string;
    status?: 'DRAFT' | 'PUBLISHED';
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
    const startedAt = Date.now();
    try {
      const { property } = await this.updatePropertyUseCase.execute({
        id,
        dto: updatePropertyDto,
        userId,
        organizationId,
      });
      await this.bumpOrgPropertiesVersion(organizationId ?? undefined);
      this.markOperation('update', startedAt, true);
      return property;
    } catch (err) {
      this.markOperation('update', startedAt, false);
      this.mapError(err);
    }
  }

  async remove(id: string, userId: string, organizationId?: string | null) {
    const startedAt = Date.now();
    try {
      await this.deletePropertyUseCase.execute({
        id,
        userId,
        organizationId,
      });
      await this.bumpOrgPropertiesVersion(organizationId ?? undefined);
      this.markOperation('remove', startedAt, true);
    } catch (err) {
      this.markOperation('remove', startedAt, false);
      this.mapError(err);
    }
  }

  async publish(id: string, userId: string, organizationId?: string | null) {
    const startedAt = Date.now();
    try {
      const { property } = await this.publishPropertyUseCase.execute({
        id,
        userId,
        organizationId,
      });
      await this.bumpOrgPropertiesVersion(organizationId ?? undefined);
      await this.bumpPublicPropertiesVersion();
      this.markOperation('publish', startedAt, true);
      return property;
    } catch (err) {
      this.markOperation('publish', startedAt, false);
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

  private markOperation(name: string, startedAt: number, ok: boolean): void {
    const durationMs = Date.now() - startedAt;
    this.metrics.observe('properties_operation_duration_ms', durationMs, {
      operation: name,
      status: ok ? 'ok' : 'error',
    });
    this.metrics.inc('properties_operation_total', 1, {
      operation: name,
      status: ok ? 'ok' : 'error',
    });

    if (!ok) {
      this.logger.warn(
        `properties operation failed: ${name} (${durationMs}ms)`,
      );
    }
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
