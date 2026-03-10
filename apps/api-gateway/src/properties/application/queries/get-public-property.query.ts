/**
 * Query: obtener una propiedad pública por id.
 */

import { Inject, Injectable } from '@nestjs/common';
import {
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { IPropertiesRepository } from '../../domain/ports/properties.repository';

@Injectable()
export class GetPublicPropertyQuery {
  constructor(
    @Inject('IPropertiesRepository')
    private readonly repository: IPropertiesRepository,
  ) {}

  async execute(id: string): Promise<Record<string, unknown>> {
    try {
      return await this.repository.findOnePublic(id);
    } catch (err) {
      if (err instanceof Error && err.message === 'Property not found') {
        throw new NotFoundException('Property not found');
      }
      throw new ServiceUnavailableException(
        'No se pudo conectar con la base de datos. Comprueba DATABASE_URL y que las tablas existan.',
      );
    }
  }
}
