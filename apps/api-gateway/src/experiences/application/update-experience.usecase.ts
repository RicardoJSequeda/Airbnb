/**
 * Caso de uso: actualizar experiencia.
 */

import { Inject, Injectable } from '@nestjs/common';
import type { IExperiencesRepository } from '../domain/ports/experiences.repository';
import type { UpdateExperienceDto } from '../dto/update-experience.dto';
import { ApplicationForbiddenError, ApplicationNotFoundError } from './errors';

export interface UpdateExperienceInput {
  id: string;
  dto: UpdateExperienceDto;
  hostId: string;
  organizationId: string;
}

export interface UpdateExperienceOutput {
  experience: Record<string, unknown>;
}

@Injectable()
export class UpdateExperienceUseCase {
  constructor(
    @Inject('IExperiencesRepository')
    private readonly repository: IExperiencesRepository,
  ) {}

  async execute(input: UpdateExperienceInput): Promise<UpdateExperienceOutput> {
    const { id, dto, hostId, organizationId } = input;

    const existing = await this.repository.findById(id, organizationId);
    if (!existing) {
      throw new ApplicationNotFoundError('Experience not found');
    }

    if ((existing.hostId as string) !== hostId) {
      throw new ApplicationForbiddenError(
        'You can only update your own experiences',
      );
    }

    const experience = await this.repository.update(id, dto, organizationId);
    return { experience };
  }
}
