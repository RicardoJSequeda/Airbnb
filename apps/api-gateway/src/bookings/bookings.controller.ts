import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { OrganizationGuard } from '../common/guards/organization.guard';
import { SubscriptionGuard } from '../common/guards/subscription.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/prisma-enums';

@Controller('bookings')
@UseGuards(SupabaseAuthGuard, OrganizationGuard, SubscriptionGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @Request() req) {
    return this.bookingsService.create(
      createBookingDto,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Get('my-bookings')
  findMyBookings(@Request() req) {
    return this.bookingsService.findAllByGuest(
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Get('host-bookings')
  @UseGuards(RolesGuard)
  @Roles(UserRole.HOST, UserRole.ADMIN, UserRole.SUPER_ADMIN)
  findHostBookings(@Request() req) {
    return this.bookingsService.findAllByHost(
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.bookingsService.findOne(
      id,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Request() req) {
    return this.bookingsService.cancel(
      id,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Patch(':id/confirm')
  confirm(@Param('id') id: string, @Request() req) {
    return this.bookingsService.confirm(
      id,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Request() req) {
    return this.bookingsService.reject(
      id,
      req.user.userId,
      req.user.organizationId,
    );
  }
}
