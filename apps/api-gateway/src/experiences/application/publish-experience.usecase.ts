/**
 * Caso de uso: publicar experiencia.
 */

import { Inject, Injectable } from '@nestjs/common';
import type { IExperiencesRepository } from '../domain/ports/experiences.repository';
import { ApplicationForbiddenError, ApplicationNotFoundError } from './errors';

export interface PublishExperienceInput {
  id: string;
  hostId: string;
  organizationId: string;
}

export interface PublishExperienceOutput {
  experience: Record<string, unknown>;
}

@Injectable()
export class PublishExperienceUseCase {
  constructor(
    @Inject('IExperiencesRepository')
    private readonly repository: IExperiencesRepository,
  ) {}

  async execute(input: PublishExperienceInput): Promise<PublishExperienceOutput> {
    const { id, hostId, organizationId } = input;

    const existing = await this.repository.findById(id, organizationId);
    if (!existing) {
      throw new ApplicationNotFoundError('Experience not found');
    }

    if ((existing.hostId as string) !== hostId) {
      throw new ApplicationForbiddenError(
        'You can only publish your own experiences',
      );
    }

    const experience = await this.repository.publish(id);
    return { experience };
  }
}
