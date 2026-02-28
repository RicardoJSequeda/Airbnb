import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaService } from '../common/prisma.service';
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

@Module({
  imports: [ConfigModule],
  controllers: [BookingsController],
  providers: [
    PrismaService,
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
    CreateBookingUseCase,
    CancelBookingUseCase,
    ConfirmBookingUseCase,
    RejectBookingUseCase,
    BookingsService,
    SubscriptionGuard,
  ],
})
export class BookingsModule {}
