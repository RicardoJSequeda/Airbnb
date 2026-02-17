import { Controller, Get, Param, Query } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { Public } from '../common/decorators/public.decorator';

/**
 * API pública del marketplace.
 * No requiere autenticación.
 * Solo devuelve propiedades PUBLISHED.
 * Nunca expone organizationId.
 */
@Controller('public/properties')
@Public()
export class PublicPropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  findAll(
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('propertyType') propertyType?: string,
  ) {
    return this.propertiesService.findAllPublic({ city, country, propertyType });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOnePublic(id);
  }
}
