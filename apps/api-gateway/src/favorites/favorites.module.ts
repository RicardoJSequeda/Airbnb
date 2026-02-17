import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { PrismaService } from '../common/prisma.service';
import { SubscriptionGuard } from '../common/guards/subscription.guard';

@Module({
  controllers: [FavoritesController],
  providers: [FavoritesService, PrismaService, SubscriptionGuard],
})
export class FavoritesModule {}
