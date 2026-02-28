import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

const PROPERTY_LIST_CACHE_TTL = 60;

@Injectable()
export class PropertiesService {
  private readonly logger = new Logger(PropertiesService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(
    createPropertyDto: CreatePropertyDto,
    hostId: string,
    organizationId: string,
  ) {
    const { amenities, images, ...rest } = createPropertyDto;

    const property = await this.prisma.property.create({
      data: {
        ...rest,
        hostId,
        organizationId,
        amenities: JSON.stringify(amenities ?? []),
        images: JSON.stringify(images ?? []),
        status: 'DRAFT',
      },
    });

    return this.formatProperty(property);
  }

  async findAll(filters?: {
    city?: string;
    country?: string;
    propertyType?: string;
    organizationId?: string | null;
  }) {
    const where: any = { status: 'PUBLISHED' };
    if (filters?.organizationId) where.organizationId = filters.organizationId;

    if (filters?.city) where.city = filters.city;
    if (filters?.country) where.country = filters.country;
    if (filters?.propertyType) where.propertyType = filters.propertyType;

    const cacheKey = `properties:list:${where.organizationId ?? ''}:${filters?.city ?? ''}:${filters?.country ?? ''}:${filters?.propertyType ?? ''}`;
    try {
      if (this.redis.isAvailable()) {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          try {
            return JSON.parse(cached);
          } catch {
            /* invalid cache */
          }
        }
      }
    } catch {
      /* Redis down: seguir con Prisma */
    }

    const properties = await this.prisma.property.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    const result = properties.map((p) => this.formatProperty(p));
    try {
      if (this.redis.isAvailable()) {
        await this.redis.set(
          cacheKey,
          JSON.stringify(result),
          PROPERTY_LIST_CACHE_TTL,
        );
      }
    } catch {
      /* Redis down: ignorar cache */
    }
    return result;
  }

  async findOne(id: string, organizationId?: string | null) {
    const where: { id: string; organizationId?: string } = { id };
    if (organizationId) where.organizationId = organizationId;

    const property = await this.prisma.property.findFirst({
      where,
      include: {
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
          },
        },
        reviews: {
          include: {
            guest: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return this.formatProperty(property);
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    userId: string,
    organizationId?: string | null,
  ) {
    const where: any = { id, hostId: userId };
    if (organizationId) where.organizationId = organizationId;

    const property = await this.prisma.property.findFirst({ where });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const { amenities, images, ...rest } = updatePropertyDto;

    const updated = await this.prisma.property.update({
      where: { id },
      data: {
        ...rest,
        ...(amenities && { amenities: JSON.stringify(amenities) }),
        ...(images && { images: JSON.stringify(images) }),
      },
    });

    return this.formatProperty(updated);
  }

  async remove(id: string, userId: string, organizationId?: string | null) {
    const where: any = { id, hostId: userId };
    if (organizationId) where.organizationId = organizationId;

    const property = await this.prisma.property.findFirst({ where });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    await this.prisma.property.delete({
      where: { id },
    });

    return { message: 'Property deleted successfully' };
  }

  async publish(id: string, userId: string, organizationId?: string | null) {
    const where: any = { id, hostId: userId };
    if (organizationId) where.organizationId = organizationId;

    const property = await this.prisma.property.findFirst({ where });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const updated = await this.prisma.property.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });

    return this.formatProperty(updated);
  }

  /** API pública: todas las propiedades PUBLISHED del marketplace (sin org filter). Nunca expone organizationId. */
  async findAllPublic(filters?: {
    city?: string;
    country?: string;
    propertyType?: string;
  }) {
    try {
      const where: any = { status: 'PUBLISHED' };
      if (filters?.city) where.city = filters.city;
      if (filters?.country) where.country = filters.country;
      if (filters?.propertyType) where.propertyType = filters.propertyType;

      const cacheKey = `public:properties:${filters?.city ?? ''}:${filters?.country ?? ''}:${filters?.propertyType ?? ''}`;
      try {
        if (this.redis.isAvailable()) {
          const cached = await this.redis.get(cacheKey);
          if (cached) {
            try {
              return JSON.parse(cached);
            } catch {
              /* invalid cache */
            }
          }
        }
      } catch {
        /* Redis down: seguir con Prisma */
      }

      const properties = await this.prisma.property.findMany({
        where,
        include: {
          host: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      const result = properties.map((p) => this.formatPropertyForPublic(p));
      try {
        if (this.redis.isAvailable()) {
          await this.redis.set(
            cacheKey,
            JSON.stringify(result),
            PROPERTY_LIST_CACHE_TTL,
          );
        }
      } catch {
        /* Redis down: ignorar cache */
      }
      return result;
    } catch (err) {
      this.logger.warn(
        `findAllPublic failed (returning []): ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    }
  }

  /** API pública: una propiedad PUBLISHED por id. Nunca expone organizationId. */
  async findOnePublic(id: string) {
    try {
      const property = await this.prisma.property.findFirst({
        where: { id, status: 'PUBLISHED' },
        include: {
          host: {
            select: {
              id: true,
              name: true,
              avatar: true,
              email: true,
            },
          },
          reviews: {
            include: {
              guest: {
                select: {
                  name: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      if (!property) {
        throw new NotFoundException('Property not found');
      }

      return this.formatPropertyForPublic(property);
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.warn(
        `findOnePublic failed: ${err instanceof Error ? err.message : String(err)}`,
      );
      throw new ServiceUnavailableException(
        'No se pudo conectar con la base de datos. Comprueba DATABASE_URL y que las tablas existan.',
      );
    }
  }

  private formatProperty(property: any) {
    const { amenities, images, price, ...rest } = property;

    return {
      ...rest,
      price: price != null ? Number(price) : price,
      amenities: this.safeJsonParse(amenities, []),
      images: this.safeJsonParse(images, []),
    };
  }

  private safeJsonParse(value: unknown, fallback: unknown): unknown {
    if (value == null || value === '') return fallback;
    try {
      const s = typeof value === 'string' ? value : String(value);
      return JSON.parse(s);
    } catch {
      return fallback;
    }
  }

  /** Formato para API pública: omite organizationId, incluye averageRating y totalReviews. */
  private formatPropertyForPublic(property: any) {
    const formatted = this.formatProperty(property);
    const { organizationId, ...publicData } = formatted;

    const reviews = Array.isArray(property.reviews) ? property.reviews : [];
    const totalReviews = reviews.length;
    const sum = reviews.reduce(
      (acc: number, r: any) =>
        acc + (typeof r?.rating === 'number' ? r.rating : 0),
      0,
    );
    const averageRating =
      totalReviews > 0 ? Math.round((sum / totalReviews) * 10) / 10 : 0;

    return {
      ...publicData,
      averageRating,
      totalReviews,
    };
  }
}
