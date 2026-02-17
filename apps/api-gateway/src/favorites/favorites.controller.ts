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

@Controller('favorites')
@UseGuards(SupabaseAuthGuard, OrganizationGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':propertyId')
  addFavorite(@Param('propertyId') propertyId: string, @Request() req) {
    return this.favoritesService.addFavorite(
      propertyId,
      req.user.userId,
      req.user.organizationId ?? null,
    );
  }

  @Delete(':propertyId')
  removeFavorite(@Param('propertyId') propertyId: string, @Request() req) {
    return this.favoritesService.removeFavorite(
      propertyId,
      req.user.userId,
      req.user.organizationId ?? null,
    );
  }

  @Post('toggle/:propertyId')
  toggleFavorite(@Param('propertyId') propertyId: string, @Request() req) {
    return this.favoritesService.toggleFavorite(
      propertyId,
      req.user.userId,
      req.user.organizationId ?? null,
    );
  }

  @Get()
  getFavorites(@Request() req) {
    return this.favoritesService.getFavorites(
      req.user.userId,
      req.user.organizationId ?? null,
    );
  }

  @Get('check/:propertyId')
  checkIsFavorite(@Param('propertyId') propertyId: string, @Request() req) {
    return this.favoritesService.checkIsFavorite(
      propertyId,
      req.user.userId,
      req.user.organizationId ?? null,
    );
  }

  @Get('count/:propertyId')
  getFavoriteCount(@Param('propertyId') propertyId: string, @Request() req) {
    return this.favoritesService.getFavoriteCount(
      propertyId,
      req.user.organizationId ?? null,
    );
  }
}