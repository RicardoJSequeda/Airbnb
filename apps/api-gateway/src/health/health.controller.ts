import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';
import { HealthService } from './health.service';

@Controller()
@SkipThrottle()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  @Public()
  async health() {
    return this.healthService.health();
  }

  @Get('ready')
  @Public()
  async ready() {
    return this.healthService.ready();
  }

  @Get('live')
  @Public()
  live() {
    return this.healthService.live();
  }
}
