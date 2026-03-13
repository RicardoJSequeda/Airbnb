import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class InterestsService {
  private readonly logger = new Logger(InterestsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    try {
      this.logger.log('Fetching all interests from database...');
      // @ts-ignore - Handle potential missing type in gateway node_modules
      if (!this.prisma.interest) {
        this.logger.error('Prisma model "interest" is not defined on PrismaService');
        throw new Error('Prisma model "interest" is missing');
      }
      
      return await this.prisma.interest.findMany({
        orderBy: { label: 'asc' },
      });
    } catch (error) {
      this.logger.error(`Error in InterestsService.findAll: ${error.message}`);
      throw new InternalServerErrorException('No se pudieron obtener los intereses');
    }
  }
}
