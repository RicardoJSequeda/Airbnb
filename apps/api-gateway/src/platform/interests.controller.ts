import { Controller, Get } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('interests')
export class InterestsController {
  constructor(private readonly interestsService: InterestsService) {}

  @Get()
  @Public()
  async findAll() {
    return this.interestsService.findAll();
  }
}
