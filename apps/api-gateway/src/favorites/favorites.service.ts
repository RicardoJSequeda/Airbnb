import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

type PropertyWhere = { id: string; organizationId?: string };
type FavoriteWhereWithProperty = {
  userId: string;
  propertyId: string;
  property?: { organizationId: string };
};
type FavoriteWhereByUser = {
  userId: string;
  property?: { organizationId: string };
};
type FavoriteWhereByProperty = {
  propertyId: string;
  property?: { organizationId: string };
};

type PropertyWithImages = {
  images?: string | null;
  propertyImages?: Array<{ imageUrl: string; displayOrder: number }>;
};

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async addFavorite(
    propertyId: string,
    userId: string,
    organizationId?: string | null,
  ) {
    const where: PropertyWhere = { id: propertyId };
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
            propertyImages: {
              select: { imageUrl: true, displayOrder: true },
              orderBy: { displayOrder: 'asc' },
            },
          },
        },
      },
    });

    const fav = favorite as {
      property: PropertyWithImages;
    } & Record<string, unknown>;
    return {
      ...fav,
      property: {
        ...fav.property,
        images: this.getPropertyImages(fav.property),
      },
    } as Record<string, unknown>;
  }

  async removeFavorite(
    propertyId: string,
    userId: string,
    organizationId?: string | null,
  ) {
    const where: FavoriteWhereWithProperty = { userId, propertyId };
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

  async toggleFavorite(
    propertyId: string,
    userId: string,
    organizationId?: string | null,
  ) {
    const where: PropertyWhere = { id: propertyId };
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
    const where: FavoriteWhereByUser = { userId };
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
            propertyImages: {
              select: { imageUrl: true, displayOrder: true },
              orderBy: { displayOrder: 'asc' },
            },
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

    return favorites.map((favorite) => {
      const fav = favorite as {
        property: PropertyWithImages;
      } & Record<string, unknown>;
      return {
        ...fav,
        property: {
          ...fav.property,
          images: this.getPropertyImages(fav.property),
        },
      } as Record<string, unknown>;
    });
  }

  async checkIsFavorite(
    propertyId: string,
    userId: string,
    organizationId?: string | null,
  ) {
    const where: FavoriteWhereWithProperty = { userId, propertyId };
    if (organizationId) where.property = { organizationId };

    const favorite = await this.prisma.favorite.findFirst({ where });
    return {
      isFavorite: !!favorite,
      favoriteId: favorite?.id || null,
    };
  }

  async getFavoriteCount(propertyId: string, organizationId?: string | null) {
    const where: FavoriteWhereByProperty = { propertyId };
    if (organizationId) where.property = { organizationId };

    const count = await this.prisma.favorite.count({ where });
    return { count };
  }

  private getPropertyImages(property: PropertyWithImages) {
    if (
      Array.isArray(property.propertyImages) &&
      property.propertyImages.length > 0
    ) {
      return property.propertyImages
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((image) => image.imageUrl);
    }

    try {
      return JSON.parse(property.images || '[]') as string[];
    } catch {
      return [];
    }
  }
}
