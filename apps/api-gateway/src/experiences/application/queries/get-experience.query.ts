/**
 * Query: obtener una experiencia por id (dashboard).
 */

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IExperiencesRepository } from '../../domain/ports/experiences.repository';

@Injectable()
export class GetExperienceQuery {
  constructor(
    @Inject('IExperiencesRepository')
    private readonly repository: IExperiencesRepository,
  ) {}

  async execute(id: string, organizationId?: string | null): Promise<Record<string, unknown>> {
    const experience = await this.repository.findById(id, organizationId);
    if (!experience) {
      throw new NotFoundException('Experience not found');
    }
    return experience;
  }
}
