import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateExperienceBookingDto } from './dto/create-experience-booking.dto';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { OrganizationGuard } from '../common/guards/organization.guard';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/prisma-enums';
import { RequireIdempotency } from '../common/decorators/idempotency.decorator';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('bookings')
@UseGuards(SupabaseAuthGuard, OrganizationGuard, SubscriptionGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @RequireIdempotency()
  create(
    @Body() createBookingDto: CreateBookingDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.bookingsService.create(
      createBookingDto,
      req.user.userId,
      req.user.organizationId ?? '',
    );
  }

  @Post('experience')
  @RequireIdempotency()
  createExperience(
    @Body() dto: CreateExperienceBookingDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.bookingsService.createExperience(
      dto,
      req.user.userId,
      req.user.organizationId ?? '',
    );
  }

  @Get('my-bookings')
  findMyBookings(@Request() req: AuthenticatedRequest) {
    return this.bookingsService.findAllByGuest(
      req.user.userId,
      req.user.organizationId ?? '',
    );
  }

  @Get('host-bookings')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HOST, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findHostBookings(@Request() req: AuthenticatedRequest) {
    return this.bookingsService.findAllByHost(
      req.user.userId,
      req.user.organizationId ?? '',
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.bookingsService.findOne(
      id,
      req.user.userId,
      req.user.organizationId ?? '',
    );
  }

  @Patch(':id/cancel')
  @RequireIdempotency()
  cancel(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.bookingsService.cancel(
      id,
      req.user.userId,
      req.user.organizationId ?? '',
    );
  }

  @Patch(':id/confirm')
  @RequireIdempotency()
  confirm(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.bookingsService.confirm(
      id,
      req.user.userId,
      req.user.organizationId ?? '',
    );
  }

  @Patch(':id/reject')
  @RequireIdempotency()
  reject(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.bookingsService.reject(
      id,
      req.user.userId,
      req.user.organizationId ?? '',
    );
  }
}
