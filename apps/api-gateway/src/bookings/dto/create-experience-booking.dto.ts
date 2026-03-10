import {
  IsString,
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateExperienceBookingDto {
  @IsString()
  experienceId: string;

  @IsString()
  slotId: string;

  @IsDateString()
  date: string;

  @IsNumber()
  @Min(1)
  adults: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  children?: number;
}
