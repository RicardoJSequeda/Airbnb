/**
 * Query: obtener una propiedad por id (dashboard).
 */

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IPropertiesRepository } from '../../domain/ports/properties.repository';

@Injectable()
export class GetPropertyQuery {
  constructor(
    @Inject('IPropertiesRepository')
    private readonly repository: IPropertiesRepository,
  ) {}

  async execute(
    id: string,
    organizationId?: string | null,
  ): Promise<Record<string, unknown>> {
    const property = await this.repository.findById(id, organizationId);
    if (!property) {
      throw new NotFoundException('Property not found');
    }
    return property;
  }
}
