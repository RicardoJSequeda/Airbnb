/**
 * Caso de uso: actualizar propiedad.
 */

import { Inject, Injectable } from '@nestjs/common';
import type { IPropertiesRepository } from '../domain/ports/properties.repository';
import type { UpdatePropertyDto } from '../dto/update-property.dto';
import { ApplicationForbiddenError, ApplicationNotFoundError } from './errors';

export interface UpdatePropertyInput {
  id: string;
  dto: UpdatePropertyDto;
  userId: string;
  organizationId?: string | null;
}

export interface UpdatePropertyOutput {
  property: Record<string, unknown>;
}

@Injectable()
export class UpdatePropertyUseCase {
  constructor(
    @Inject('IPropertiesRepository')
    private readonly repository: IPropertiesRepository,
  ) {}

  async execute(input: UpdatePropertyInput): Promise<UpdatePropertyOutput> {
    const { id, dto, userId, organizationId } = input;

    const existing = await this.repository.findById(id, organizationId);
    if (!existing) {
      throw new ApplicationNotFoundError('Property not found');
    }

    if ((existing.hostId as string) !== userId) {
      throw new ApplicationForbiddenError(
        'You can only update your own properties',
      );
    }

    const property = await this.repository.update(id, dto);
    return { property };
  }
}
