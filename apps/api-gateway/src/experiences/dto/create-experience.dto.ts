import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsDecimal,
  Min,
  Max,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

export class CreateExperienceDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDecimal({ decimal_digits: '0,2' })
  pricePerParticipant: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  maxParticipants: number;

  @IsNumber()
  @Min(15)
  duration: number; // en minutos

  @IsString()
  category: string; // "tour", "workshop", "tasting", "adventure", etc.

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludes?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  meetingPoint?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsString()
  ageRestriction?: string;
}
