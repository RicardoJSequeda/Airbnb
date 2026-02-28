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
    const { includes, excludes, images, languages, ...rest } = createExperienceDto;

    const experience = await this.prisma.experience.create({
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

    const { includes, excludes, images, languages, ...rest } = updateExperienceDto;
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

    const updated = await this.prisma.experience.update({
      where: { id },
      data: updateData,
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
        include: {
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
        },
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
        include: {
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
        },
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

  private safeJsonParse(value: string | null | undefined, fallback: string[] | string = '[]'): any {
    if (value == null || value === '') return typeof fallback === 'string' ? [] : fallback;
    try {
      return JSON.parse(value);
    } catch {
      return typeof fallback === 'string' ? [] : fallback;
    }
  }

  private formatExperience(experience: any) {
    const { includes, excludes, images, languages, pricePerParticipant, ...rest } = experience;

    return {
      ...rest,
      pricePerParticipant: pricePerParticipant != null ? Number(pricePerParticipant) : pricePerParticipant,
      includes: this.safeJsonParse(includes),
      excludes: this.safeJsonParse(excludes),
      images: this.safeJsonParse(images),
      languages: this.safeJsonParse(languages),
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
