import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StripeService } from './stripe.service';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { PrismaPaymentsClient } from '../contexts/payments/infrastructure/prisma-payments.client';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    StripeService,
    PrismaPaymentsClient,
    PrismaService,
    SubscriptionGuard,
  ],
})
export class PaymentsModule {}
