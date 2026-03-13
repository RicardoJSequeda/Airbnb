import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('interests')
export class InterestsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  async findAll() {
    return this.prisma.interest.findMany({
      orderBy: { label: 'asc' },
    });
  }
}
