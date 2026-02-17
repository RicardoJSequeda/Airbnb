import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaService } from '../common/prisma.service';
import { StripeService } from '../payments/stripe.service';
import { SubscriptionGuard } from '../common/guards/subscription.guard';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, PrismaService, StripeService, SubscriptionGuard],
})
export class BookingsModule {}
