import { Controller, Get, Post, Query, Body, Param } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { LocationsService } from './locations.service';

@Controller('public/locations')
@Public()
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  /**
   * Destinos sugeridos. Query params: department (slug), limit, sortBy (displayOrder | trending)
   */
  @Get('suggestions')
  async getSuggestions(
    @Query('department') department?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: 'displayOrder' | 'trending',
  ) {
    return this.locationsService.getSuggestions({
      departmentSlug: department || undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy: sortBy || 'displayOrder',
    });
  }

  /**
   * Barrios/lugares de una ciudad. Param: citySlug (ej: medellin)
   */
  @Get('cities/:citySlug/places')
  async getPlacesByCity(@Param('citySlug') citySlug: string) {
    return this.locationsService.getPlacesByCity(citySlug);
  }

  /**
   * Lista de departamentos (para escalar a más regiones)
   */
  @Get('departments')
  async getDepartments() {
    return this.locationsService.getDepartments();
  }

  /**
   * Búsqueda de ciudades por nombre
   */
  @Get('search')
  async searchCities(
    @Query('q') query?: string,
    @Query('limit') limit?: string,
  ) {
    if (!query || query.trim().length < 2) return [];
    return this.locationsService.searchCities(query, limit ? parseInt(limit, 10) : 10);
  }

  /**
   * Registrar búsqueda (para tendencias)
   */
  @Post('search-log')
  async logSearch(@Body('cityId') cityId: string) {
    if (!cityId) return { ok: false };
    await this.locationsService.logSearch(cityId);
    return { ok: true };
  }
}
