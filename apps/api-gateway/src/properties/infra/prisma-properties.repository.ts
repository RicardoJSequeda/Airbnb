/**
 * Implementación de IPropertiesRepository con Prisma.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import type {
  IPropertiesRepository,
  FormattedProperty,
  CreatePropertyData,
  UpdatePropertyData,
  ListPropertiesFilters,
  ListPublicPropertiesFilters,
} from '../domain/ports/properties.repository';

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

@Injectable()
export class PrismaPropertiesRepository implements IPropertiesRepository {
  constructor(private readonly prisma: PrismaService) {}

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

  private safeJsonParse<T>(value: unknown, fallback: T): T {
    if (value == null || value === '') return fallback;
    if (typeof value !== 'string') return fallback;
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  private formatProperty(property: PropertyWithRelations): FormattedProperty {
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

  private formatPropertyForPublic(
    property: PublicPropertyRow,
  ): FormattedProperty {
    const formatted = this.formatProperty(property);
    const { organizationId: _oid, ...publicData } = formatted;
    void _oid;

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

  async create(data: CreatePropertyData): Promise<FormattedProperty> {
    const { amenities, images, hostId, organizationId, ...rest } = data;

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

  async findById(
    id: string,
    organizationId?: string | null,
  ): Promise<FormattedProperty | null> {
    const where: { id: string; hostId?: string; organizationId?: string } = {
      id,
    };
    if (organizationId) where.organizationId = organizationId;

    const property = await this.prisma.property.findFirst({
      where,
      include: this.propertyRelationsInclude({
        host: {
          select: { id: true, name: true, avatar: true, email: true },
        },
        reviews: {
          include: {
            guest: { select: { name: true, avatar: true } },
          },
        },
      }),
    });

    if (!property) return null;
    return this.formatProperty(property as PropertyWithRelations);
  }

  async findMany(filters: ListPropertiesFilters): Promise<FormattedProperty[]> {
    const where: Record<string, unknown> = {};
    if (filters.organizationId) where.organizationId = filters.organizationId;
    if (filters.status) where.status = filters.status;
    if (filters.city) where.city = filters.city;
    if (filters.country) where.country = filters.country;
    if (filters.propertyType) where.propertyType = filters.propertyType;

    const properties = await this.prisma.property.findMany({
      where,
      include: this.propertyRelationsInclude({
        host: { select: { id: true, name: true, avatar: true } },
      }),
    });

    return properties.map((p) =>
      this.formatProperty(p as PropertyWithRelations),
    );
  }

  async update(id: string, data: UpdatePropertyData): Promise<FormattedProperty> {
    const { amenities, images, ...rest } = data;

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

  async delete(id: string): Promise<void> {
    await this.prisma.property.delete({ where: { id } });
  }

  async publish(id: string): Promise<FormattedProperty> {
    const updated = await this.prisma.property.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
    return this.formatProperty(updated as PropertyWithRelations);
  }

  async findManyPublic(
    filters: ListPublicPropertiesFilters,
  ): Promise<FormattedProperty[]> {
    const where: Record<string, unknown> = { status: 'PUBLISHED' };
    if (filters.city) where.city = filters.city;
    if (filters.country) where.country = filters.country;
    if (filters.propertyType) where.propertyType = filters.propertyType;

    const properties = await this.prisma.property.findMany({
      where,
      include: this.propertyRelationsInclude({
        host: { select: { id: true, name: true, avatar: true } },
      }),
    });

    return properties.map((p) =>
      this.formatPropertyForPublic(p as PublicPropertyRow),
    );
  }

  async findOnePublic(id: string): Promise<FormattedProperty> {
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
            guest: { select: { name: true, avatar: true } },
          },
        },
      }),
    });

    if (!property) {
      throw new Error('Property not found');
    }

    return this.formatPropertyForPublic(property as PublicPropertyRow);
  }
}
