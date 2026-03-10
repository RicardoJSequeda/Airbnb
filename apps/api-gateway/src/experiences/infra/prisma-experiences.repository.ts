/**
 * Implementación de IExperiencesRepository con Prisma.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import type {
  IExperiencesRepository,
  FormattedExperience,
  CreateExperienceData,
  UpdateExperienceData,
  ListExperiencesFilters,
  ListPublicExperiencesFilters,
} from '../domain/ports/experiences.repository';

type ExperienceIncludeRow = { itemText: string };
type ExperienceImageRow = { imageUrl: string; displayOrder: number };
type ExperienceLanguageRow = { languageCode: string };

type ExperienceWithRelations = {
  includes: string | null;
  excludes: string | null;
  images: string | null;
  languages: string | null;
  pricePerParticipant: number | null;
  experienceIncludes?: ExperienceIncludeRow[] | null;
  experienceImages?: ExperienceImageRow[] | null;
  experienceLanguages?: ExperienceLanguageRow[] | null;
} & Record<string, unknown>;

type PublicReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  guest: { name: string | null; avatar: string | null } | null;
  createdAt: Date;
};

type PublicExperienceRow = ExperienceWithRelations & {
  organizationId?: string | null;
  host?: {
    occupation?: string | null;
    bio?: string | null;
    registrationNumber?: string | null;
  } | null;
  reviews?: PublicReviewRow[] | null;
};

@Injectable()
export class PrismaExperiencesRepository implements IExperiencesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private experienceRelationsInclude(extra: Record<string, unknown> = {}) {
    return {
      experienceIncludes: {
        select: { itemText: true },
      },
      experienceLanguages: {
        select: { languageCode: true },
      },
      experienceImages: {
        select: { imageUrl: true, displayOrder: true },
        orderBy: { displayOrder: 'asc' as const },
      },
      ...extra,
    };
  }

  private safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
    if (value == null || value === '') return fallback;
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  private formatExperience(
    experience: ExperienceWithRelations,
  ): FormattedExperience {
    const {
      includes,
      excludes,
      images,
      languages,
      experienceIncludes,
      experienceImages,
      experienceLanguages,
      pricePerParticipant,
      ...rest
    } = experience;

    const includesFromRelations =
      Array.isArray(experienceIncludes) && experienceIncludes.length > 0
        ? experienceIncludes.map((item) => item.itemText)
        : null;

    const imagesFromRelations =
      Array.isArray(experienceImages) && experienceImages.length > 0
        ? experienceImages
            .slice()
            .sort(
              (a: ExperienceImageRow, b: ExperienceImageRow) =>
                a.displayOrder - b.displayOrder,
            )
            .map((item) => item.imageUrl)
        : null;

    const languagesFromRelations =
      Array.isArray(experienceLanguages) && experienceLanguages.length > 0
        ? experienceLanguages.map((item) => item.languageCode)
        : null;

    return {
      ...rest,
      pricePerParticipant:
        pricePerParticipant != null
          ? Number(pricePerParticipant)
          : pricePerParticipant,
      includes:
        includesFromRelations ?? this.safeJsonParse<string[]>(includes, []),
      excludes: this.safeJsonParse<string[]>(excludes, []),
      images:
        imagesFromRelations ?? this.safeJsonParse<string[]>(images, []),
      languages:
        languagesFromRelations ?? this.safeJsonParse<string[]>(languages, []),
    };
  }

  private formatExperienceForPublic(
    experience: PublicExperienceRow,
  ): FormattedExperience {
    const formatted = this.formatExperience(experience);
    const { organizationId: _oid, ...publicData } = formatted;
    void _oid;

    const reviews = experience.reviews ?? [];
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Math.round(
            (reviews.reduce(
              (acc: number, r: PublicReviewRow) => acc + r.rating,
              0,
            ) /
              totalReviews) *
              10,
          ) / 10
        : 0;

    const host = experience.host;
    return {
      ...publicData,
      averageRating,
      totalReviews,
      hostOccupation: host?.occupation ?? undefined,
      hostBio: host?.bio ?? undefined,
      hostRegistrationNumber: host?.registrationNumber ?? undefined,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        guest: r.guest,
        createdAt: r.createdAt,
      })),
    };
  }

  async create(data: CreateExperienceData): Promise<FormattedExperience> {
    const {
      includes,
      excludes,
      images,
      languages,
      hostId,
      organizationId,
      ...rest
    } = data;

    const experience = await this.prisma.$transaction(async (tx) => {
      const created = await tx.experience.create({
        data: {
          ...rest,
          hostId,
          organizationId,
          includes: JSON.stringify(includes ?? []),
          excludes: excludes ? JSON.stringify(excludes) : null,
          images: JSON.stringify(images ?? []),
          languages: languages ? JSON.stringify(languages) : null,
          status: 'DRAFT',
        },
      });

      if (includes?.length) {
        await tx.experienceInclude.createMany({
          data: includes.map((itemText) => ({
            experienceId: created.id,
            itemText,
          })),
        });
      }

      if (images?.length) {
        await tx.experienceImage.createMany({
          data: images.map((imageUrl, index) => ({
            experienceId: created.id,
            imageUrl,
            displayOrder: index,
            isCover: index === 0,
          })),
        });
      }

      if (languages?.length) {
        await tx.experienceLanguage.createMany({
          data: languages.map((languageCode) => ({
            experienceId: created.id,
            languageCode,
          })),
        });
      }

      return tx.experience.findUniqueOrThrow({
        where: { id: created.id },
        include: this.experienceRelationsInclude(),
      });
    });

    return this.formatExperience(experience as unknown as ExperienceWithRelations);
  }

  async findById(
    id: string,
    organizationId?: string | null,
  ): Promise<FormattedExperience | null> {
    const where: { id: string; organizationId?: string } = { id };
    if (organizationId) where.organizationId = organizationId;

    const experience = await this.prisma.experience.findFirst({
      where,
      include: this.experienceRelationsInclude({
        host: { select: { id: true, name: true, avatar: true } },
      }),
    });

    if (!experience) return null;
    return this.formatExperience(experience as unknown as ExperienceWithRelations);
  }

  async findMany(filters: ListExperiencesFilters): Promise<FormattedExperience[]> {
    const where: Record<string, unknown> = { status: 'PUBLISHED' };
    if (filters.organizationId) where.organizationId = filters.organizationId;
    if (filters.city) where.city = filters.city;
    if (filters.country) where.country = filters.country;
    if (filters.category) where.category = filters.category;
    if (filters.minParticipants) {
      where.maxParticipants = { gte: filters.minParticipants };
    }

    const experiences = await this.prisma.experience.findMany({
      where,
      include: this.experienceRelationsInclude({
        host: { select: { id: true, name: true, avatar: true } },
      }),
    });

    return experiences.map((e) =>
      this.formatExperience(e as unknown as ExperienceWithRelations),
    );
  }

  async update(
    id: string,
    data: UpdateExperienceData,
    organizationId: string,
  ): Promise<FormattedExperience> {
    const { includes, excludes, images, languages, ...rest } = data;
    const updateData: Record<string, unknown> = { ...rest };

    if (includes !== undefined) updateData.includes = JSON.stringify(includes);
    if (excludes !== undefined)
      updateData.excludes = excludes ? JSON.stringify(excludes) : null;
    if (images !== undefined) updateData.images = JSON.stringify(images);
    if (languages !== undefined)
      updateData.languages = languages ? JSON.stringify(languages) : null;

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.experience.update({ where: { id }, data: updateData });

      if (includes !== undefined) {
        await tx.experienceInclude.deleteMany({ where: { experienceId: id } });
        if (includes.length > 0) {
          await tx.experienceInclude.createMany({
            data: includes.map((itemText) => ({ experienceId: id, itemText })),
          });
        }
      }

      if (images !== undefined) {
        await tx.experienceImage.deleteMany({ where: { experienceId: id } });
        if (images.length > 0) {
          await tx.experienceImage.createMany({
            data: images.map((imageUrl, index) => ({
              experienceId: id,
              imageUrl,
              displayOrder: index,
              isCover: index === 0,
            })),
          });
        }
      }

      if (languages !== undefined) {
        await tx.experienceLanguage.deleteMany({
          where: { experienceId: id },
        });
        if (languages.length > 0) {
          await tx.experienceLanguage.createMany({
            data: languages.map((languageCode) => ({
              experienceId: id,
              languageCode,
            })),
          });
        }
      }

      return tx.experience.findUniqueOrThrow({
        where: { id },
        include: this.experienceRelationsInclude(),
      });
    });

    return this.formatExperience(updated as unknown as ExperienceWithRelations);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.experience.delete({ where: { id } });
  }

  async publish(id: string): Promise<FormattedExperience> {
    const updated = await this.prisma.experience.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
    return this.formatExperience(updated as unknown as ExperienceWithRelations);
  }

  private static readonly SERVICE_CATEGORIES = [
    'tasting',
    'adventure',
    'workshop',
  ];

  async findManyPublic(
    filters: ListPublicExperiencesFilters,
  ): Promise<FormattedExperience[]> {
    const where: Record<string, unknown> = { status: 'PUBLISHED' };
    if (filters.city) where.city = filters.city;
    if (filters.country) where.country = filters.country;
    if (filters.category) {
      where.category = filters.category;
    } else if (filters.listingType === 'service') {
      where.category = { in: PrismaExperiencesRepository.SERVICE_CATEGORIES };
    } else if (filters.listingType === 'experience') {
      where.category = {
        notIn: PrismaExperiencesRepository.SERVICE_CATEGORIES,
      };
    }
    if (filters.minParticipants) {
      where.maxParticipants = { gte: filters.minParticipants };
    }

    const experiences = await this.prisma.experience.findMany({
      where,
      include: this.experienceRelationsInclude({
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
            occupation: true,
            bio: true,
            registrationNumber: true,
          },
        },
        reviews: {
          include: {
            guest: { select: { name: true, avatar: true } },
          },
        },
      }),
    });

    return experiences.map((e) =>
      this.formatExperienceForPublic(e as unknown as PublicExperienceRow),
    );
  }

  async findOnePublic(id: string): Promise<FormattedExperience> {
    const experience = await this.prisma.experience.findFirst({
      where: { id, status: 'PUBLISHED' },
      include: this.experienceRelationsInclude({
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
            email: true,
            occupation: true,
            bio: true,
            registrationNumber: true,
          },
        },
        reviews: {
          include: {
            guest: { select: { name: true, avatar: true } },
          },
        },
      }),
    });

    if (!experience) {
      throw new Error('Experience not found');
    }

    return this.formatExperienceForPublic(
      experience as unknown as PublicExperienceRow,
    );
  }
}
