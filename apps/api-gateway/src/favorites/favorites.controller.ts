import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { OrganizationGuard } from '../common/guards/organization.guard';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('favorites')
@UseGuards(SupabaseAuthGuard, OrganizationGuard, SubscriptionGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':propertyId')
  addFavorite(
    @Param('propertyId') propertyId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.favoritesService.addFavorite(
      propertyId,
      req.user.userId,
      req.user.organizationId ?? null,
    );
  }

  @Delete(':propertyId')
  removeFavorite(
    @Param('propertyId') propertyId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.favoritesService.removeFavorite(
      propertyId,
      req.user.userId,
      req.user.organizationId ?? null,
    );
  }

  @Post('toggle/:propertyId')
  toggleFavorite(
    @Param('propertyId') propertyId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.favoritesService.toggleFavorite(
      propertyId,
      req.user.userId,
      req.user.organizationId ?? null,
    );
  }

  @Get()
  getFavorites(@Request() req: AuthenticatedRequest) {
    return this.favoritesService.getFavorites(
      req.user.userId,
      req.user.organizationId ?? null,
    );
  }

  @Get('check/:propertyId')
  checkIsFavorite(
    @Param('propertyId') propertyId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.favoritesService.checkIsFavorite(
      propertyId,
      req.user.userId,
      req.user.organizationId ?? null,
    );
  }

  @Get('count/:propertyId')
  getFavoriteCount(
    @Param('propertyId') propertyId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.favoritesService.getFavoriteCount(
      propertyId,
      req.user.organizationId ?? null,
    );
  }
}
