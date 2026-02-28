/**
 * Implementación de IPaymentsRepository con Prisma.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import type {
  IPaymentsRepository,
  PaymentSnapshot,
  UpdatePaymentStatusData,
} from '../domain/ports/payments.repository';

@Injectable()
export class PrismaPaymentsRepository implements IPaymentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByBookingId(bookingId: string): Promise<PaymentSnapshot | null> {
    const p = await this.prisma.payment.findUnique({
      where: { bookingId },
    });
    if (!p) return null;
    return {
      id: p.id,
      bookingId: p.bookingId,
      stripePaymentIntentId: p.stripePaymentIntentId,
      status: p.status,
      amount: Number(p.amount),
    };
  }

  async updateStatus(
    bookingId: string,
    data: UpdatePaymentStatusData,
  ): Promise<void> {
    await this.prisma.payment.update({
      where: { bookingId },
      data: {
        status: data.status as any,
        ...(data.paidAt && { paidAt: data.paidAt }),
        ...(data.platformFeeAmount != null && {
          platformFeeAmount: data.platformFeeAmount,
        }),
        ...(data.hostNetAmount != null && {
          hostNetAmount: data.hostNetAmount,
        }),
      },
    });
  }
}
