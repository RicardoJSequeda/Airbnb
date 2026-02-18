import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { StripeService } from './stripe.service';
import { PrismaService } from '../common/prisma.service';
import { SubscriptionGuard } from '../common/guards/subscription.guard';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, StripeService, PrismaService, SubscriptionGuard],
})
export class PaymentsModule {}
