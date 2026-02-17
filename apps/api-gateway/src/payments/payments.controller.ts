import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import type { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { SkipThrottle } from '@nestjs/throttler';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { OrganizationGuard } from '../common/guards/organization.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(SupabaseAuthGuard, OrganizationGuard)
  createPaymentIntent(@Body() createPaymentIntentDto: CreatePaymentIntentDto, @Request() req) {
    return this.paymentsService.createPaymentIntent(createPaymentIntentDto, req.user.userId);
  }

  @Post('confirm')
  @UseGuards(SupabaseAuthGuard, OrganizationGuard)
  confirmPayment(@Body() confirmPaymentDto: ConfirmPaymentDto, @Request() req) {
    return this.paymentsService.confirmPayment(confirmPaymentDto, req.user.userId);
  }

  @Get('booking/:bookingId')
  @UseGuards(SupabaseAuthGuard, OrganizationGuard)
  getPaymentByBooking(@Param('bookingId') bookingId: string, @Request() req) {
    return this.paymentsService.getPaymentByBooking(bookingId, req.user.userId, req.user.organizationId);
  }

  @Post(':id/refund')
  @UseGuards(SupabaseAuthGuard, OrganizationGuard)
  refundPayment(@Param('id') id: string, @Request() req) {
    return this.paymentsService.refundPayment(id, req.user.userId, req.user.organizationId);
  }

  @Post('webhook')
  @Public()
  @SkipThrottle()
  async handleWebhook(
    @Req() req: RawBodyRequest<ExpressRequest>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw body');
    }
    return this.paymentsService.handleWebhook(req.rawBody, signature);
  }
}