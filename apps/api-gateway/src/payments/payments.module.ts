import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StripeService } from './stripe.service';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    StripeService,
    PrismaService,
    SubscriptionGuard,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
