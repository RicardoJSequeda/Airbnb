import { IsString, IsNumber, IsArray, IsOptional, Min, Max } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsNumber()
  @Min(1)
  maxGuests: number;

  @IsNumber()
  @Min(1)
  bedrooms: number;

  @IsNumber()
  @Min(1)
  bathrooms: number;

  @IsString()
  propertyType: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  country: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsArray()
  @IsString({ each: true })
  amenities: string[];

  @IsArray()
  @IsString({ each: true })
  images: string[];
}