import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { OrganizationGuard } from '../common/guards/organization.guard';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('dashboard/properties')
@UseGuards(SupabaseAuthGuard, OrganizationGuard, SubscriptionGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post('draft')
  createDraft(@Request() req: AuthenticatedRequest) {
    return this.propertiesService.createDraft(
      req.user.userId,
      req.user.organizationId ?? '',
    );
  }

  @Post()
  create(
    @Body() createPropertyDto: CreatePropertyDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.propertiesService.create(
      createPropertyDto,
      req.user.userId,
      req.user.organizationId ?? '',
    );
  }

  @Get()
  findAll(
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('propertyType') propertyType?: string,
    @Query('status') status?: 'DRAFT' | 'PUBLISHED',
    @Request() req?: AuthenticatedRequest,
  ) {
    return this.propertiesService.findAll({
      city,
      country,
      propertyType,
      status,
      organizationId: req?.user?.organizationId ?? null,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.propertiesService.findOne(id, req.user?.organizationId ?? null);
  }

  @Patch(':id/draft')
  saveDraft(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.propertiesService.update(
      id,
      updatePropertyDto,
      req.user.userId,
      req.user.organizationId ?? undefined,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.propertiesService.update(
      id,
      updatePropertyDto,
      req.user.userId,
      req.user.organizationId ?? undefined,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.propertiesService.remove(
      id,
      req.user.userId,
      req.user.organizationId ?? undefined,
    );
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.propertiesService.publish(
      id,
      req.user.userId,
      req.user.organizationId ?? undefined,
    );
  }
}
