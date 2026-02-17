import { IsString, IsNumber, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @IsString()
  bookingId: string;
}
