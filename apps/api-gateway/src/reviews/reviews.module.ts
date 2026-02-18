import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { PrismaService } from '../common/prisma.service';
import { SubscriptionGuard } from '../common/guards/subscription.guard';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, PrismaService, SubscriptionGuard],
})
export class ReviewsModule {}
