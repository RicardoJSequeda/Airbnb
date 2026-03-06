import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';

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

    return this.formatExperience(experience as unknown as ExperienceWithRelations);
  }

  async findAll(filters?: {
    city?: string;
    country?: string;
    category?: string;
    organizationId?: string | null;
    minParticipants?: number;
  }): Promise<unknown[]> {
    const where: Record<string, unknown> = { status: 'PUBLISHED' };
    if (filters?.organizationId) where.organizationId = filters.organizationId;

    if (filters?.city) where.city = filters.city;
    if (filters?.country) where.country = filters.country;
    if (filters?.category) where.category = filters.category;
    if (filters?.minParticipants) {
      where.maxParticipants = { gte: filters.minParticipants };
    }

    const orgId =
      typeof where.organizationId === 'string' ? where.organizationId : '';
    const cacheKey = `experiences:list:${orgId}:${filters?.city ?? ''}:${filters?.country ?? ''}:${filters?.category ?? ''}`;
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

    const result = experiences.map((e) =>
      this.formatExperience(e as unknown as ExperienceWithRelations),
    );
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

    return this.formatExperience(experience as unknown as ExperienceWithRelations);
  }

  async update(
    id: string,
    updateExperienceDto: UpdateExperienceDto,
    hostId: string,
    organizationId: string,
  ): Promise<unknown> {
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
    const updateData: Record<string, unknown> = { ...rest };

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

    return this.formatExperience(updated as unknown as ExperienceWithRelations);
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

    return this.formatExperience(updated as unknown as ExperienceWithRelations);
  }

  /** Categorías que se consideran "servicios" (solo aparecen en módulo Servicios). El resto son "experiencias". */
  private static readonly SERVICE_CATEGORIES = [
    'tasting',
    'adventure',
    'workshop',
  ];

  /** API pública: todas las experiencias PUBLISHED. Nunca expone organizationId. Si la BD falla, devuelve []. */
  async findAllPublic(filters?: {
    city?: string;
    country?: string;
    category?: string;
    minParticipants?: number;
    listingType?: 'service' | 'experience';
  }): Promise<unknown[]> {
    try {
      const where: Record<string, unknown> = { status: 'PUBLISHED' };

      if (filters?.city) where.city = filters.city;
      if (filters?.country) where.country = filters.country;
      if (filters?.category) {
        where.category = filters.category;
      } else if (filters?.listingType === 'service') {
        where.category = { in: ExperiencesService.SERVICE_CATEGORIES };
      } else if (filters?.listingType === 'experience') {
        where.category = { notIn: ExperiencesService.SERVICE_CATEGORIES };
      }
      if (filters?.minParticipants) {
        where.maxParticipants = { gte: filters.minParticipants };
      }

      const cacheKey = `public:experiences:${filters?.city ?? ''}:${filters?.country ?? ''}:${filters?.category ?? ''}:${filters?.listingType ?? ''}`;
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

      const result = experiences.map((e) =>
        this.formatExperienceForPublic(e as unknown as PublicExperienceRow),
      );
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

      return this.formatExperienceForPublic(
        experience as unknown as PublicExperienceRow,
      );
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

  private safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
    if (value == null || value === '') {
      return fallback;
    }
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  private formatExperience(
    experience: ExperienceWithRelations,
  ): Record<string, unknown> {
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
      // Seed / datos legacy: puede existir JSON en columnas (includes/images/languages) sin filas relacionadas.
      includes:
        includesFromRelations ??
        this.safeJsonParse<string[]>(includes, [] as string[]),
      excludes: this.safeJsonParse<string[]>(excludes, [] as string[]),
      images:
        imagesFromRelations ??
        this.safeJsonParse<string[]>(images, [] as string[]),
      languages:
        languagesFromRelations ??
        this.safeJsonParse<string[]>(languages, [] as string[]),
    };
  }

  /** Formato para API pública: omite organizationId, incluye averageRating y totalReviews. */
  private formatExperienceForPublic(
    experience: PublicExperienceRow,
  ): Record<string, unknown> {
    const formatted = this.formatExperience(experience);
    const { organizationId: _organizationId, ...publicData } = formatted;
    void _organizationId;

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
}
