import { Controller, Get, Header } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { MetricsService } from './metrics.service';

@Controller()
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get('metrics')
  @Public()
  @Header('Content-Type', 'text/plain; version=0.0.4')
  getMetrics(): string {
    return this.metrics.renderPrometheus();
  }
}
