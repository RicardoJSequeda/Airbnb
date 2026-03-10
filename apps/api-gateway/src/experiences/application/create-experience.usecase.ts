/**
 * Caso de uso: crear experiencia.
 */

import { Inject, Injectable } from '@nestjs/common';
import type { IExperiencesRepository } from '../domain/ports/experiences.repository';
import type { CreateExperienceDto } from '../dto/create-experience.dto';

export interface CreateExperienceInput {
  dto: CreateExperienceDto;
  hostId: string;
  organizationId: string;
}

export interface CreateExperienceOutput {
  experience: Record<string, unknown>;
}

@Injectable()
export class CreateExperienceUseCase {
  constructor(
    @Inject('IExperiencesRepository')
    private readonly repository: IExperiencesRepository,
  ) {}

  async execute(input: CreateExperienceInput): Promise<CreateExperienceOutput> {
    const { dto, hostId, organizationId } = input;
    const { includes, excludes, images, languages, ...rest } = dto;

    const experience = await this.repository.create({
      ...rest,
      hostId,
      organizationId,
      includes,
      excludes,
      images,
      languages,
    });

    return { experience };
  }
}
