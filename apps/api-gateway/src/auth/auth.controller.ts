import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import { SupabaseAuthGuard } from '../common/guards/supabase-auth.guard';
import { OrganizationGuard } from '../common/guards/organization.guard';
import { Public } from '../common/decorators/public.decorator';
import type { AuthenticatedRequest } from '../common/types/authenticated-request';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('oauth-login')
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  oauthLogin(@Body() dto: OAuthLoginDto) {
    return this.authService.oauthLogin(dto.accessToken);
  }

  @Get('me')
  @UseGuards(SupabaseAuthGuard, OrganizationGuard)
  getProfile(@Request() req: AuthenticatedRequest) {
    return this.authService.getProfile(req.user.userId);
  }

  @Post('logout')
  @UseGuards(SupabaseAuthGuard)
  logout(@Request() req: AuthenticatedRequest) {
    if (req.user.jti) {
      return this.authService.logout(req.user.jti).then(() => ({ success: true }));
    }
    return { success: true };
  }
}
