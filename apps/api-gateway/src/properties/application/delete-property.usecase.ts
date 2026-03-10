/**
 * Caso de uso: eliminar propiedad.
 */

import { Inject, Injectable } from '@nestjs/common';
import type { IPropertiesRepository } from '../domain/ports/properties.repository';
import { ApplicationForbiddenError, ApplicationNotFoundError } from './errors';

export interface DeletePropertyInput {
  id: string;
  userId: string;
  organizationId?: string | null;
}

@Injectable()
export class DeletePropertyUseCase {
  constructor(
    @Inject('IPropertiesRepository')
    private readonly repository: IPropertiesRepository,
  ) {}

  async execute(input: DeletePropertyInput): Promise<void> {
    const { id, userId, organizationId } = input;

    const existing = await this.repository.findById(id, organizationId);
    if (!existing) {
      throw new ApplicationNotFoundError('Property not found');
    }

    if ((existing.hostId as string) !== userId) {
      throw new ApplicationForbiddenError(
        'You can only delete your own properties',
      );
    }

    await this.repository.delete(id);
  }
}
