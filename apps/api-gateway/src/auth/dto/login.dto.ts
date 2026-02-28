import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail(undefined, { message: 'Email no válido' })
  email: string;

  @IsString()
  @MinLength(1, { message: 'La contraseña es obligatoria' })
  password: string; // Longitud mínima validada en frontend (8 para registro)
}
