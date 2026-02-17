import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class UpdateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  comment?: string;
}