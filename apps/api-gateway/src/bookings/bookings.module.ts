import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { StripeService } from '../payments/stripe.service';
import { RedisService } from '../common/redis.service';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { StripePortAdapter } from './infra/stripe.port.adapter';
import { RedisPortAdapter } from './infra/redis.port.adapter';
import { PrismaBookingsRepository } from './infra/prisma-bookings.repository';
import { PrismaPaymentsRepository } from './infra/prisma-payments.repository';
import { CreateBookingUseCase } from './application/create-booking.usecase';
import { CancelBookingUseCase } from './application/cancel-booking.usecase';
import { ConfirmBookingUseCase } from './application/confirm-booking.usecase';
import { RejectBookingUseCase } from './application/reject-booking.usecase';
import { PrismaBookingsQueryRepository } from './infra/prisma-bookings-query.repository';
import { GetBookingDetailsQuery } from './application/queries/get-booking-details.query';
import { GetBookingsByGuestQuery } from './application/queries/get-bookings-by-guest.query';
import { GetBookingsByHostQuery } from './application/queries/get-bookings-by-host.query';
import { PrismaBookingsClient } from '../contexts/bookings/infrastructure/prisma-bookings.client';
import { PrismaPaymentsClient } from '../contexts/payments/infrastructure/prisma-payments.client';

@Module({
  imports: [ConfigModule],
  controllers: [BookingsController],
  providers: [
    PrismaBookingsClient,
    PrismaPaymentsClient,
    StripeService,
    RedisService,
    {
      provide: 'IRedisPort',
      useClass: RedisPortAdapter,
    },
    {
      provide: 'IStripePort',
      useClass: StripePortAdapter,
    },
    PrismaPaymentsRepository,
    {
      provide: 'IPaymentsRepository',
      useExisting: PrismaPaymentsRepository,
    },
    PrismaBookingsRepository,
    {
      provide: 'IBookingsRepository',
      useExisting: PrismaBookingsRepository,
    },
    PrismaBookingsQueryRepository,
    {
      provide: 'IBookingsQueryRepository',
      useExisting: PrismaBookingsQueryRepository,
    },
    CreateBookingUseCase,
    CancelBookingUseCase,
    ConfirmBookingUseCase,
    RejectBookingUseCase,
    GetBookingDetailsQuery,
    GetBookingsByGuestQuery,
    GetBookingsByHostQuery,
    BookingsService,
    SubscriptionGuard,
  ],
})
export class BookingsModule {}
