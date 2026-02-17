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

@Controller('dashboard/properties')
@UseGuards(SupabaseAuthGuard, OrganizationGuard, SubscriptionGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  create(@Body() createPropertyDto: CreatePropertyDto, @Request() req) {
    return this.propertiesService.create(
      createPropertyDto,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Get()
  findAll(
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('propertyType') propertyType?: string,
    @Request() req?: { user?: { organizationId?: string | null } },
  ) {
    return this.propertiesService.findAll({
      city,
      country,
      propertyType,
      organizationId: req?.user?.organizationId ?? null,
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req: { user?: { organizationId?: string | null } },
  ) {
    return this.propertiesService.findOne(id, req.user?.organizationId ?? null);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePropertyDto: UpdatePropertyDto,
    @Request() req,
  ) {
    return this.propertiesService.update(
      id,
      updatePropertyDto,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.propertiesService.remove(
      id,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string, @Request() req) {
    return this.propertiesService.publish(
      id,
      req.user.userId,
      req.user.organizationId,
    );
  }
}
