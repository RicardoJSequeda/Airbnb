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
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { OrganizationGuard } from '../common/guards/organization.guard';
import { SubscriptionGuard } from '../common/guards/subscription.guard';

@Controller('reviews')
@UseGuards(SupabaseAuthGuard, OrganizationGuard, SubscriptionGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
    return this.reviewsService.create(
      createReviewDto,
      req.user.userId,
      req.user.organizationId ?? null,
    );
  }

  @Get('property/:propertyId')
  findByProperty(@Param('propertyId') propertyId: string, @Request() req) {
    return this.reviewsService.findByProperty(
      propertyId,
      req.user.organizationId ?? null,
    );
  }

  @Get('my-reviews')
  findMyReviews(@Request() req) {
    return this.reviewsService.findByUser(
      req.user.userId,
      req.user.organizationId ?? null,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.reviewsService.findOne(id, req.user.organizationId ?? null);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Request() req,
  ) {
    return this.reviewsService.update(
      id,
      updateReviewDto,
      req.user.userId,
      req.user.organizationId ?? null,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(
      id,
      req.user.userId,
      req.user.organizationId ?? null,
    );
  }
}
