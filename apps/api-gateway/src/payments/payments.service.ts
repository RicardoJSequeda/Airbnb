import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';
import { RedisService } from '../common/redis.service';
import { StripeService } from './stripe.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { calculatePlatformFee } from '../common/commission.utils';

const holdKey = (bookingId: string) => `booking:hold:${bookingId}`;

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private stripeService: StripeService,
    private configService: ConfigService,
  ) {}

  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto, userId: string) {
    const { bookingId } = createPaymentIntentDto;

    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId },
      include: {
        property: {
          select: {
            title: true,
            hostId: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.guestId !== userId) {
      throw new ForbiddenException('You can only pay for your own bookings');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException('Booking must be confirmed before payment');
    }

    const existingPayment = await this.prisma.payment.findUnique({
      where: { bookingId },
    });

    if (existingPayment && existingPayment.status === 'COMPLETED') {
      throw new BadRequestException('Booking already paid');
    }

    const amount = Number(booking.totalPrice);
    const paymentIntent = await this.stripeService.createPaymentIntent(
      amount,
      'usd',
      {
        bookingId: booking.id,
        guestId: booking.guestId,
        propertyTitle: booking.property.title,
      },
    );

    const payment = await this.prisma.payment.upsert({
      where: { bookingId },
      create: {
        bookingId,
        organizationId: booking.organizationId,
        amount,
        currency: 'usd',
        stripePaymentIntentId: paymentIntent.id,
        status: 'PENDING',
      },
      update: {
        stripePaymentIntentId: paymentIntent.id,
        status: 'PENDING',
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      payment,
    };
  }

  async confirmPayment(confirmPaymentDto: ConfirmPaymentDto, userId: string) {
    const { paymentIntentId, bookingId } = confirmPaymentDto;

    const paymentIntent = await this.stripeService.retrievePaymentIntent(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment not successful');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { bookingId },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    // Idempotencia: si ya está COMPLETED, devolver paymentBreakdown existente sin recalcular.
    if (payment.status === 'COMPLETED') {
      const totalAmount = Number(payment.amount);
      const platformFee = payment.platformFeeAmount != null
        ? Number(payment.platformFeeAmount)
        : 0;
      const hostNetAmount = payment.hostNetAmount != null
        ? Number(payment.hostNetAmount)
        : totalAmount;

      return {
        ...payment,
        paymentBreakdown: {
          totalAmount,
          platformFee,
          hostNetAmount,
        },
      };
    }

    // Transición PENDING -> COMPLETED: calcular comisión con Decimal para precisión.
    const totalAmount = payment.amount;
    const feePercentage =
      parseFloat(this.configService.get<string>('PLATFORM_FEE_PERCENTAGE') ?? '0') || 0;
    const { platformFee, hostNet } = calculatePlatformFee(totalAmount, feePercentage);

    const updatedPayment = await this.prisma.payment.update({
      where: { bookingId },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
        platformFeeAmount: platformFee,
        hostNetAmount: hostNet,
      },
    });

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });

    await this.redis.del(holdKey(bookingId));

    return {
      ...updatedPayment,
      paymentBreakdown: {
        totalAmount: Number(totalAmount),
        platformFee: Number(platformFee),
        hostNetAmount: Number(hostNet),
      },
    };
  }

  async getPaymentByBooking(bookingId: string, userId: string, organizationId?: string | null) {
    const where: { id: string; organizationId?: string } = { id: bookingId };
    if (organizationId) where.organizationId = organizationId;

    const booking = await this.prisma.booking.findFirst({
      where,
      include: {
        property: {
          select: {
            hostId: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.guestId !== userId && booking.property.hostId !== userId) {
      throw new ForbiddenException('You can only view payments for your bookings');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            property: {
              select: {
                id: true,
                title: true,
              },
            },
            guest: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async refundPayment(paymentId: string, userId: string, organizationId?: string | null) {
    const paymentWhere: { id: string; organizationId?: string } = { id: paymentId };
    if (organizationId) paymentWhere.organizationId = organizationId;

    const payment = await this.prisma.payment.findFirst({
      where: paymentWhere,
      include: {
        booking: {
          include: {
            property: {
              select: {
                hostId: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.booking.property.hostId !== userId) {
      throw new ForbiddenException('Only the property host can issue refunds');
    }

    if (payment.status !== 'COMPLETED') {
      throw new BadRequestException('Can only refund completed payments');
    }

    if (!payment.stripePaymentIntentId) {
      throw new BadRequestException('Payment intent ID not found');
    }

    const refund = await this.stripeService.createRefund(
      payment.stripePaymentIntentId,
      Number(payment.amount),
    );

    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REFUNDED',
      },
    });

    await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: 'REFUNDED',
      },
    });

    return {
      payment: updatedPayment,
      refund,
    };
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const event = await this.stripeService.constructWebhookEvent(payload, signature);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      case 'charge.refunded':
        await this.handleRefund(event.data.object);
        break;
    }

    return { received: true };
  }

  /**
   * Webhook: payment_intent.succeeded.
   * Idempotencia: Stripe puede reenviar webhooks. No recalcular comisión si el pago ya está
   * COMPLETED o si platformFeeAmount ya tiene valor (evita doble procesamiento y race conditions).
   */
  private async handlePaymentSuccess(paymentIntent: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (!payment) return;

    // Idempotencia: si ya procesado (confirm() o webhook previo), no hacer nada.
    if (payment.status === 'COMPLETED') return;

    // No recalcular si la comisión ya fue calculada (ej: confirm() procesó antes que el webhook).
    // Si platformFeeAmount existe, confirm() ya actualizó todo; solo sincronizar booking/redis.
    if (payment.platformFeeAmount != null) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED', paidAt: new Date() },
      });
      await this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'CONFIRMED' },
      });
      await this.redis.del(holdKey(payment.bookingId));
      return;
    }

    // Transición PENDING -> COMPLETED: calcular comisión una sola vez con Prisma.Decimal.
    const totalAmount = payment.amount;
    const feePercentage =
      parseFloat(this.configService.get<string>('PLATFORM_FEE_PERCENTAGE') ?? '0') || 0;
    const { platformFee, hostNet } = calculatePlatformFee(totalAmount, feePercentage);

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        paidAt: new Date(),
        platformFeeAmount: platformFee,
        hostNetAmount: hostNet,
      },
    });

    await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CONFIRMED' },
    });

    await this.redis.del(holdKey(payment.bookingId));
  }

  private async handlePaymentFailed(paymentIntent: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
        },
      });
    }
  }

  private async handleRefund(charge: any) {
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentIntentId: charge.payment_intent },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
        },
      });

      await this.prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: 'REFUNDED',
        },
      });
    }
  }
}