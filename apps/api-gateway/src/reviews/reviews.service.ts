import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createReviewDto: CreateReviewDto,
    userId: string,
    organizationId: string | null,
  ) {
    const { bookingId, rating, comment } = createReviewDto;

    const bookingWhere: { id: string; organizationId?: string } = {
      id: bookingId,
    };
    if (organizationId) bookingWhere.organizationId = organizationId;

    const booking = await this.prisma.booking.findFirst({
      where: bookingWhere,
      include: {
        property: {
          select: {
            id: true,
            title: true,
          },
        },
        review: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.guestId !== userId) {
      throw new ForbiddenException('You can only review your own bookings');
    }

    // Verificar que el booking está completado
    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException('You can only review completed bookings');
    }

    // Verificar que no exista ya una reseña
    if (booking.review) {
      throw new BadRequestException('You already reviewed this booking');
    }

    // Verificar que el checkout ya pasó
    const now = new Date();
    if (booking.checkOut > now) {
      throw new BadRequestException('You can only review after checkout');
    }

    if (!booking.organizationId) {
      throw new BadRequestException('Booking has no organization');
    }

    // Crear la reseña (Review no tiene organizationId; se infiere por booking→property)
    const review = await this.prisma.review.create({
      data: {
        bookingId,
        propertyId: booking.propertyId,
        guestId: userId,
        rating,
        comment: comment || '',
      },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return review;
  }

  async findByProperty(propertyId: string, organizationId?: string | null) {
    const property = await this.prisma.property.findFirst({
      where: { id: propertyId },
    });
    if (!property) throw new NotFoundException('Property not found');

    // Solo reviews de esa property (organization se infiere por property)
    const targetOrgId = organizationId ?? property.organizationId;
    const reviews = await this.prisma.review.findMany({
      where: {
        propertyId,
        property: targetOrgId ? { organizationId: targetOrgId } : undefined,
      },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular rating promedio
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) /
          reviews.length
        : 0;

    return {
      reviews,
      summary: {
        totalReviews: reviews.length,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingBreakdown: this.calculateRatingBreakdown(reviews),
      },
    };
  }

  async findByUser(userId: string, organizationId: string | null) {
    const where: {
      guestId: string;
      property?: { organizationId: string };
    } = { guestId: userId };
    if (organizationId) where.property = { organizationId };

    const reviews = await this.prisma.review.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            country: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return reviews.map((review) => ({
      ...review,
      property: {
        ...review.property,
        images: JSON.parse(review.property.images || '[]'),
      },
    }));
  }

  async findOne(id: string, organizationId?: string | null) {
    const where: { id: string; property?: { organizationId: string } } = { id };
    if (organizationId) where.property = { organizationId };

    const review = await this.prisma.review.findFirst({
      where,
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
            city: true,
            country: true,
          },
        },
        booking: {
          select: {
            id: true,
            checkIn: true,
            checkOut: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }

  async update(
    id: string,
    updateReviewDto: UpdateReviewDto,
    userId: string,
    organizationId?: string | null,
  ) {
    const baseWhere: {
      id: string;
      guestId: string;
      property?: { organizationId: string };
    } = { id, guestId: userId };
    if (organizationId) baseWhere.property = { organizationId };

    const review = await this.prisma.review.findFirst({ where: baseWhere });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const updated = await this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        property: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return updated;
  }

  async remove(id: string, userId: string, organizationId?: string | null) {
    const baseWhere: {
      id: string;
      guestId: string;
      property?: { organizationId: string };
    } = { id, guestId: userId };
    if (organizationId) baseWhere.property = { organizationId };

    const review = await this.prisma.review.findFirst({
      where: baseWhere,
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    await this.prisma.review.delete({
      where: { id },
    });

    return { message: 'Review deleted successfully' };
  }

  private calculateRatingBreakdown(reviews: any[]) {
    const breakdown = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((review) => {
      breakdown[review.rating as keyof typeof breakdown]++;
    });

    return breakdown;
  }
}
