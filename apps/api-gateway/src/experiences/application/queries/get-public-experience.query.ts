/**
 * Query: obtener una experiencia pública por id.
 */

import { Inject, Injectable } from '@nestjs/common';
import {
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { IExperiencesRepository } from '../../domain/ports/experiences.repository';

@Injectable()
export class GetPublicExperienceQuery {
  constructor(
    @Inject('IExperiencesRepository')
    private readonly repository: IExperiencesRepository,
  ) {}

  async execute(id: string): Promise<Record<string, unknown>> {
    try {
      return await this.repository.findOnePublic(id);
    } catch (err) {
      if (err instanceof Error && err.message === 'Experience not found') {
        throw new NotFoundException('Experience not found');
      }
      throw new ServiceUnavailableException(
        'No se pudo conectar con la base de datos. Comprueba DATABASE_URL y que las tablas existan.',
      );
    }
  }
}
