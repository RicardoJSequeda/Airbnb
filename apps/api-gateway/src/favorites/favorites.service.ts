import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async addFavorite(propertyId: string, userId: string, organizationId?: string | null) {
    const where: any = { id: propertyId };
    if (organizationId) where.organizationId = organizationId;

    const property = await this.prisma.property.findFirst({ where });
    if (!property) throw new NotFoundException('Property not found');

    // Verificar si ya está en favoritos
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (existingFavorite) {
      throw new ConflictException('Property already in favorites');
    }

    // Agregar a favoritos
    const favorite = await this.prisma.favorite.create({
      data: {
        userId,
        propertyId,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            price: true,
            city: true,
            country: true,
            images: true,
          },
        },
      },
    });

    return {
      ...favorite,
      property: {
        ...favorite.property,
        images: JSON.parse(favorite.property.images || '[]'),
      },
    };
  }

  async removeFavorite(propertyId: string, userId: string, organizationId?: string | null) {
    const where: any = { userId, propertyId };
    if (organizationId) where.property = { organizationId };

    const favorite = await this.prisma.favorite.findFirst({ where });
    if (!favorite) throw new NotFoundException('Favorite not found');

    await this.prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });

    return { message: 'Removed from favorites' };
  }

  async toggleFavorite(propertyId: string, userId: string, organizationId?: string | null) {
    const where: any = { id: propertyId };
    if (organizationId) where.organizationId = organizationId;

    const property = await this.prisma.property.findFirst({ where });
    if (!property) throw new NotFoundException('Property not found');

    // Verificar si ya está en favoritos
    const existingFavorite = await this.prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
    });

    if (existingFavorite) {
      // Remover de favoritos
      await this.prisma.favorite.delete({
        where: { id: existingFavorite.id },
      });
      return {
        isFavorite: false,
        message: 'Removed from favorites',
      };
    } else {
      // Agregar a favoritos
      await this.prisma.favorite.create({
        data: {
          userId,
          propertyId,
        },
      });
      return {
        isFavorite: true,
        message: 'Added to favorites',
      };
    }
  }

  async getFavorites(userId: string, organizationId?: string | null) {
    const where: any = { userId };
    if (organizationId) where.property = { organizationId };

    const favorites = await this.prisma.favorite.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            currency: true,
            city: true,
            country: true,
            propertyType: true,
            maxGuests: true,
            bedrooms: true,
            bathrooms: true,
            images: true,
            host: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return favorites.map((favorite) => ({
      ...favorite,
      property: {
        ...favorite.property,
        images: JSON.parse(favorite.property.images || '[]'),
      },
    }));
  }

  async checkIsFavorite(propertyId: string, userId: string, organizationId?: string | null) {
    const where: any = { userId, propertyId };
    if (organizationId) where.property = { organizationId };

    const favorite = await this.prisma.favorite.findFirst({ where });
    return {
      isFavorite: !!favorite,
      favoriteId: favorite?.id || null,
    };
  }

  async getFavoriteCount(propertyId: string, organizationId?: string | null) {
    const where: any = { propertyId };
    if (organizationId) where.property = { organizationId };

    const count = await this.prisma.favorite.count({ where });
    return { count };
  }
}