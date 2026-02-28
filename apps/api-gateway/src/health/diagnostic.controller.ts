import { Controller, Get } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../common/prisma.service';

/**
 * GET /api/public/diagnostic
 * Devuelve estado de BD y conteos para depurar por qué no se muestran datos.
 */
@Controller('public')
export class DiagnosticController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('diagnostic')
  @Public()
  async diagnostic() {
    let dbConnected: boolean = false;
    let totalProperties: number = 0;
    let publishedCount: number = 0;
    let errorMessage: string | null = null;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbConnected = true;
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        dbConnected: false,
        totalProperties: 0,
        publishedCount: 0,
        error: errorMessage,
        hint: 'Revisa DATABASE_URL y que la base de datos esté accesible.',
      };
    }

    try {
      totalProperties = await this.prisma.property.count();
      publishedCount = await this.prisma.property.count({
        where: { status: 'PUBLISHED' },
      });
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        dbConnected: true,
        totalProperties: 0,
        publishedCount: 0,
        error: errorMessage,
        hint: 'La tabla "properties" puede no existir. Ejecuta prisma db push o migraciones.',
      };
    }

    return {
      ok: true,
      dbConnected: true,
      totalProperties,
      publishedCount,
      hint:
        publishedCount === 0
          ? 'No hay propiedades con status PUBLISHED. Publica alguna desde el dashboard o inserta datos de prueba.'
          : undefined,
    };
  }
}
