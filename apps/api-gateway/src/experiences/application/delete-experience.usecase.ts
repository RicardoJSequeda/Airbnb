/**
 * Caso de uso: eliminar experiencia.
 */

import { Inject, Injectable } from '@nestjs/common';
import type { IExperiencesRepository } from '../domain/ports/experiences.repository';
import { ApplicationForbiddenError, ApplicationNotFoundError } from './errors';

export interface DeleteExperienceInput {
  id: string;
  hostId: string;
  organizationId: string;
}

@Injectable()
export class DeleteExperienceUseCase {
  constructor(
    @Inject('IExperiencesRepository')
    private readonly repository: IExperiencesRepository,
  ) {}

  async execute(input: DeleteExperienceInput): Promise<void> {
    const { id, hostId, organizationId } = input;

    const existing = await this.repository.findById(id, organizationId);
    if (!existing) {
      throw new ApplicationNotFoundError('Experience not found');
    }

    if ((existing.hostId as string) !== hostId) {
      throw new ApplicationForbiddenError(
        'You can only delete your own experiences',
      );
    }

    await this.repository.delete(id);
  }
}
