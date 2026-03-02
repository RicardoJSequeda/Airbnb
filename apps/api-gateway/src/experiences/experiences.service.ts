import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';

const EXPERIENCE_LIST_CACHE_TTL = 60;

@Injectable()
export class ExperiencesService {
  private readonly logger = new Logger(ExperiencesService.name);

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(
    createExperienceDto: CreateExperienceDto,
    hostId: string,
    organizationId: string,
  ) {
    const { includes, excludes, images, languages, ...rest } =
      createExperienceDto;

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

    return this.formatExperience(experience);
  }

  async findAll(filters?: {
    city?: string;
    country?: string;
    category?: string;
    organizationId?: string | null;
    minParticipants?: number;
  }) {
    const where: any = { status: 'PUBLISHED' };
    if (filters?.organizationId) where.organizationId = filters.organizationId;

    if (filters?.city) where.city = filters.city;
    if (filters?.country) where.country = filters.country;
    if (filters?.category) where.category = filters.category;
    if (filters?.minParticipants) {
      where.maxParticipants = { gte: filters.minParticipants };
    }

    const cacheKey = `experiences:list:${where.organizationId ?? ''}:${filters?.city ?? ''}:${filters?.country ?? ''}:${filters?.category ?? ''}`;
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

    const experiences = await this.prisma.experience.findMany({
      where,
      include: this.experienceRelationsInclude({
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      }),
    });

    const result = experiences.map((e) => this.formatExperience(e));
    if (this.redis.isAvailable()) {
      await this.redis.set(
        cacheKey,
        JSON.stringify(result),
        EXPERIENCE_LIST_CACHE_TTL,
      );
    }
    return result;
  }

  async findOne(id: string, organizationId?: string | null) {
    const where: { id: string; organizationId?: string } = { id };
    if (organizationId) where.organizationId = organizationId;

    const experience = await this.prisma.experience.findFirst({
      where,
      include: this.experienceRelationsInclude({
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      }),
    });

    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    return this.formatExperience(experience);
  }

  async update(
    id: string,
    updateExperienceDto: UpdateExperienceDto,
    hostId: string,
    organizationId: string,
  ) {
    const experience = await this.prisma.experience.findFirst({
      where: { id, organizationId },
    });

    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    if (experience.hostId !== hostId) {
      throw new ForbiddenException('You can only update your own experiences');
    }

    const { includes, excludes, images, languages, ...rest } =
      updateExperienceDto;
    const updateData: any = { ...rest };

    if (includes !== undefined) {
      updateData.includes = JSON.stringify(includes);
    }
    if (excludes !== undefined) {
      updateData.excludes = excludes ? JSON.stringify(excludes) : null;
    }
    if (images !== undefined) {
      updateData.images = JSON.stringify(images);
    }
    if (languages !== undefined) {
      updateData.languages = languages ? JSON.stringify(languages) : null;
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.experience.update({
        where: { id },
        data: updateData,
      });

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
        await tx.experienceLanguage.deleteMany({ where: { experienceId: id } });
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

    return this.formatExperience(updated);
  }

  async remove(id: string, hostId: string, organizationId: string) {
    const experience = await this.prisma.experience.findFirst({
      where: { id, organizationId },
    });

    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    if (experience.hostId !== hostId) {
      throw new ForbiddenException('You can only delete your own experiences');
    }

    await this.prisma.experience.delete({ where: { id } });
  }

  async publish(id: string, hostId: string, organizationId: string) {
    const experience = await this.prisma.experience.findFirst({
      where: { id, organizationId },
    });

    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    if (experience.hostId !== hostId) {
      throw new ForbiddenException('You can only publish your own experiences');
    }

    const updated = await this.prisma.experience.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });

    return this.formatExperience(updated);
  }

  /** API pública: todas las experiencias PUBLISHED. Nunca expone organizationId. Si la BD falla, devuelve []. */
  async findAllPublic(filters?: {
    city?: string;
    country?: string;
    category?: string;
    minParticipants?: number;
  }) {
    try {
      const where: any = { status: 'PUBLISHED' };

      if (filters?.city) where.city = filters.city;
      if (filters?.country) where.country = filters.country;
      if (filters?.category) where.category = filters.category;
      if (filters?.minParticipants) {
        where.maxParticipants = { gte: filters.minParticipants };
      }

      const cacheKey = `public:experiences:${filters?.city ?? ''}:${filters?.country ?? ''}:${filters?.category ?? ''}`;
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

      const result = experiences.map((e) => this.formatExperienceForPublic(e));
      if (this.redis.isAvailable()) {
        await this.redis.set(
          cacheKey,
          JSON.stringify(result),
          EXPERIENCE_LIST_CACHE_TTL,
        );
      }
      return result;
    } catch (err) {
      this.logger.warn(
        `findAllPublic failed (returning []): ${err instanceof Error ? err.message : String(err)}`,
      );
      return [];
    }
  }

  /** API pública: una experiencia PUBLISHED por id. Nunca expone organizationId. */
  async findOnePublic(id: string) {
    try {
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

      if (!experience) {
        throw new NotFoundException('Experience not found');
      }

      return this.formatExperienceForPublic(experience);
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

  private safeJsonParse(
    value: string | null | undefined,
    fallback: string[] | string = '[]',
  ): any {
    if (value == null || value === '')
      return typeof fallback === 'string' ? [] : fallback;
    try {
      return JSON.parse(value);
    } catch {
      return typeof fallback === 'string' ? [] : fallback;
    }
  }

  private formatExperience(experience: any) {
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

    return {
      ...rest,
      pricePerParticipant:
        pricePerParticipant != null
          ? Number(pricePerParticipant)
          : pricePerParticipant,
      includes: Array.isArray(experienceIncludes)
        ? experienceIncludes.map((item: any) => item.itemText)
        : this.safeJsonParse(includes),
      excludes: this.safeJsonParse(excludes),
      images: Array.isArray(experienceImages)
        ? experienceImages
            .slice()
            .sort((a: any, b: any) => a.displayOrder - b.displayOrder)
            .map((item: any) => item.imageUrl)
        : this.safeJsonParse(images),
      languages: Array.isArray(experienceLanguages)
        ? experienceLanguages.map((item: any) => item.languageCode)
        : this.safeJsonParse(languages),
    };
  }

  /** Formato para API pública: omite organizationId, incluye averageRating y totalReviews. */
  private formatExperienceForPublic(experience: any) {
    const formatted = this.formatExperience(experience);
    const { organizationId, ...publicData } = formatted;

    const reviews = experience.reviews ?? [];
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Math.round(
            (reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
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
      reviews: reviews.map((r: any) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        guest: r.guest,
        createdAt: r.createdAt,
      })),
    };
  }
}
