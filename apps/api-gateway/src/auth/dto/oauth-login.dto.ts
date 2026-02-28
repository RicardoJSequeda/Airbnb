import { IsString, MinLength } from 'class-validator';

export class OAuthLoginDto {
  @IsString()
  @MinLength(1, { message: 'accessToken es obligatorio' })
  accessToken: string;
}
