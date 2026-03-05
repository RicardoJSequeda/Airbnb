import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { OrganizationGuard } from '../common/guards/organization.guard';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { Public } from '../common/decorators/public.decorator';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('dashboard/experiences')
@UseGuards(SupabaseAuthGuard, OrganizationGuard, SubscriptionGuard)
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Post()
  create(
    @Body() createExperienceDto: CreateExperienceDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.experiencesService.create(
      createExperienceDto,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Get()
  findAll(
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('category') category?: string,
    @Query('minParticipants') minParticipants?: string,
    @Request() req?: AuthenticatedRequest,
  ) {
    return this.experiencesService.findAll({
      city,
      country,
      category,
      minParticipants: minParticipants
        ? parseInt(minParticipants, 10)
        : undefined,
      organizationId: req?.user?.organizationId ?? null,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.experiencesService.findOne(
      id,
      req.user?.organizationId ?? null,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExperienceDto: UpdateExperienceDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.experiencesService.update(
      id,
      updateExperienceDto,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.experiencesService.remove(
      id,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.experiencesService.publish(
      id,
      req.user.userId,
      req.user.organizationId,
    );
  }
}

/** Controlador público para el marketplace */
@Controller('public/experiences')
export class PublicExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Get()
  @Public()
  async findAll(
    @Query('city') city?: string,
    @Query('country') country?: string,
    @Query('category') category?: string,
    @Query('minParticipants') minParticipants?: string,
    @Query('listingType') listingType?: 'service' | 'experience',
  ) {
    return this.experiencesService.findAllPublic({
      city,
      country,
      category,
      minParticipants: minParticipants
        ? parseInt(minParticipants, 10)
        : undefined,
      listingType,
    });
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.experiencesService.findOnePublic(id);
  }
}
