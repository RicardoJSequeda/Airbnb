import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaService } from '../common/prisma.service';
import { StripeService } from '../payments/stripe.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, PrismaService, StripeService],
})
export class BookingsModule {}