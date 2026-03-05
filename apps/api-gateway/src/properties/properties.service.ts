import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

type PropertyAmenityRow = { amenityName: string };
type PropertyImageRow = { imageUrl: string; displayOrder: number };
type PropertyWithRelations = {
  amenities?: string | null;
  images?: string | null;
  price?: unknown;
  propertyAmenities?: PropertyAmenityRow[] | null;
  propertyImages?: PropertyImageRow[] | null;
} & Record<string, unknown>;

type PublicPropertyRow = PropertyWithRelations & {
  reviews?: Array<{ rating: number }> | null;
};

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

    const property = await this.prisma.$transaction(async (tx) => {
      const created = await tx.property.create({
        data: {
          ...rest,
          hostId,
          organizationId,
          amenities: JSON.stringify(amenities ?? []),
          images: JSON.stringify(images ?? []),
          status: 'DRAFT',
        },
      });

      if (amenities?.length) {
        await tx.propertyAmenity.createMany({
          data: amenities.map((amenityName) => ({
            propertyId: created.id,
            amenityName,
          })),
        });
      }

      if (images?.length) {
        await tx.propertyImage.createMany({
          data: images.map((imageUrl, index) => ({
            propertyId: created.id,
            imageUrl,
            displayOrder: index,
            isPrimary: index === 0,
          })),
        });
      }

      return tx.property.findUniqueOrThrow({
        where: { id: created.id },
        include: this.propertyRelationsInclude(),
      });
    });

    return this.formatProperty(property as PropertyWithRelations);
  }

  async findAll(filters?: {
    city?: string;
    country?: string;
    propertyType?: string;
    organizationId?: string | null;
  }) {
    const where: Record<string, unknown> = { status: 'PUBLISHED' };
    if (filters?.organizationId) where.organizationId = filters.organizationId;

    if (filters?.city) where.city = filters.city;
    if (filters?.country) where.country = filters.country;
    if (filters?.propertyType) where.propertyType = filters.propertyType;

    const orgId =
      typeof where.organizationId === 'string' ? where.organizationId : '';
    const cacheKey = `properties:list:${orgId}:${filters?.city ?? ''}:${filters?.country ?? ''}:${filters?.propertyType ?? ''}`;
    try {
      if (this.redis.isAvailable()) {
        const cached = await this.redis.get(cacheKey);
        if (cached) {
          try {
            return JSON.parse(cached) as unknown[];
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
      include: this.propertyRelationsInclude({
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      }),
    });

    const result = properties.map((p) =>
      this.formatProperty(p as PropertyWithRelations),
    );
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
      include: this.propertyRelationsInclude({
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
      }),
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return this.formatProperty(property as PropertyWithRelations);
  }

  async update(
    id: string,
    updatePropertyDto: UpdatePropertyDto,
    userId: string,
    organizationId?: string | null,
  ) {
    const where: { id: string; hostId: string; organizationId?: string } = {
      id,
      hostId: userId,
    };
    if (organizationId) where.organizationId = organizationId;

    const property = await this.prisma.property.findFirst({ where });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const { amenities, images, ...rest } = updatePropertyDto;

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.property.update({
        where: { id },
        data: {
          ...rest,
          ...(amenities !== undefined && {
            amenities: JSON.stringify(amenities),
          }),
          ...(images !== undefined && { images: JSON.stringify(images) }),
        },
      });

      if (amenities !== undefined) {
        await tx.propertyAmenity.deleteMany({ where: { propertyId: id } });
        if (amenities.length > 0) {
          await tx.propertyAmenity.createMany({
            data: amenities.map((amenityName) => ({
              propertyId: id,
              amenityName,
            })),
          });
        }
      }

      if (images !== undefined) {
        await tx.propertyImage.deleteMany({ where: { propertyId: id } });
        if (images.length > 0) {
          await tx.propertyImage.createMany({
            data: images.map((imageUrl, index) => ({
              propertyId: id,
              imageUrl,
              displayOrder: index,
              isPrimary: index === 0,
            })),
          });
        }
      }

      return tx.property.findUniqueOrThrow({
        where: { id },
        include: this.propertyRelationsInclude(),
      });
    });

    return this.formatProperty(updated as PropertyWithRelations);
  }

  async remove(id: string, userId: string, organizationId?: string | null) {
    const where: { id: string; hostId: string; organizationId?: string } = {
      id,
      hostId: userId,
    };
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
    const where: { id: string; hostId: string; organizationId?: string } = {
      id,
      hostId: userId,
    };
    if (organizationId) where.organizationId = organizationId;

    const property = await this.prisma.property.findFirst({ where });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    const updated = await this.prisma.property.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });

    return this.formatProperty(updated as PropertyWithRelations);
  }

  /** API pública: todas las propiedades PUBLISHED del marketplace (sin org filter). Nunca expone organizationId. */
  async findAllPublic(filters?: {
    city?: string;
    country?: string;
    propertyType?: string;
  }): Promise<unknown[]> {
    try {
      const where: Record<string, unknown> = { status: 'PUBLISHED' };
      if (filters?.city) where.city = filters.city;
      if (filters?.country) where.country = filters.country;
      if (filters?.propertyType) where.propertyType = filters.propertyType;

      const cacheKey = `public:properties:${filters?.city ?? ''}:${filters?.country ?? ''}:${filters?.propertyType ?? ''}`;
      try {
        if (this.redis.isAvailable()) {
          const cached = await this.redis.get(cacheKey);
          if (cached) {
            try {
              return JSON.parse(cached) as unknown[];
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
        include: this.propertyRelationsInclude({
          host: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        }),
      });

      const result = properties.map((p) =>
        this.formatPropertyForPublic(p as PublicPropertyRow),
      );
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
      return result as unknown[];
    } catch (err) {
      this.logger.warn(
        `findAllPublic failed (returning []): ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    }
  }

  /** API pública: una propiedad PUBLISHED por id. Nunca expone organizationId. */
  async findOnePublic(id: string): Promise<unknown> {
    try {
      const property = await this.prisma.property.findFirst({
        where: { id, status: 'PUBLISHED' },
        include: this.propertyRelationsInclude({
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
        }),
      });

      if (!property) {
        throw new NotFoundException('Property not found');
      }

      return this.formatPropertyForPublic(property) as unknown;
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

  private propertyRelationsInclude(extra: Record<string, unknown> = {}) {
    return {
      propertyAmenities: {
        select: { amenityName: true },
      },
      propertyImages: {
        select: { imageUrl: true, displayOrder: true },
        orderBy: { displayOrder: 'asc' as const },
      },
      ...extra,
    };
  }

  private formatProperty(
    property: PropertyWithRelations,
  ): Record<string, unknown> {
    const {
      amenities,
      images,
      propertyAmenities,
      propertyImages,
      price,
      ...rest
    } = property;

    const amenitiesFromRelations =
      Array.isArray(propertyAmenities) && propertyAmenities.length > 0
        ? propertyAmenities.map((item: PropertyAmenityRow) => item.amenityName)
        : null;
    const imagesFromRelations =
      Array.isArray(propertyImages) && propertyImages.length > 0
        ? propertyImages
            .slice()
            .sort(
              (a: PropertyImageRow, b: PropertyImageRow) =>
                a.displayOrder - b.displayOrder,
            )
            .map((item: PropertyImageRow) => item.imageUrl)
        : null;

    return {
      ...rest,
      price: price != null ? Number(price) : price,
      amenities: amenitiesFromRelations ?? this.safeJsonParse(amenities, []),
      images: imagesFromRelations ?? this.safeJsonParse(images, []),
    };
  }

  private safeJsonParse(value: unknown, fallback: unknown): unknown {
    if (value == null || value === '') return fallback;
    if (typeof value !== 'string') return fallback;
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  /** Formato para API pública: omite organizationId, incluye averageRating y totalReviews. */
  private formatPropertyForPublic(
    property: PublicPropertyRow,
  ): Record<string, unknown> {
    const formatted = this.formatProperty(property);
    const { organizationId: _organizationId, ...publicData } = formatted;
    void _organizationId;

    const reviews = Array.isArray(property.reviews) ? property.reviews : [];
    const totalReviews = reviews.length;
    const sum = reviews.reduce(
      (acc: number, r: { rating: number }) =>
        acc + (typeof r.rating === 'number' ? r.rating : 0),
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
