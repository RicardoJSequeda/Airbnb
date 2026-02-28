import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../common/prisma.service'
import { IBookingsReadRepository } from '../domain/booking.domain'

/**
 * Implementación basada en Prisma de las lecturas de reservas.
 * Devuelve los mismos objetos que antes consumía BookingsService.formatBooking.
 */
@Injectable()
export class PrismaBookingsReadRepository implements IBookingsReadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByGuest(guestId: string, organizationId: string): Promise<any[]> {
    return this.prisma.booking.findMany({
      where: { guestId, organizationId },
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
        review: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findAllByHost(hostId: string, organizationId?: string | null): Promise<any[]> {
    const where: { property: { hostId: string; organizationId?: string } } = {
      property: { hostId },
    }
    if (organizationId) where.property.organizationId = organizationId

    return this.prisma.booking.findMany({
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
        guest: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}

