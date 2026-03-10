/**
 * Caso de uso: publicar propiedad.
 */

import { Inject, Injectable } from '@nestjs/common';
import type { IPropertiesRepository } from '../domain/ports/properties.repository';
import { ApplicationForbiddenError, ApplicationNotFoundError } from './errors';

export interface PublishPropertyInput {
  id: string;
  userId: string;
  organizationId?: string | null;
}

export interface PublishPropertyOutput {
  property: Record<string, unknown>;
}

@Injectable()
export class PublishPropertyUseCase {
  constructor(
    @Inject('IPropertiesRepository')
    private readonly repository: IPropertiesRepository,
  ) {}

  async execute(input: PublishPropertyInput): Promise<PublishPropertyOutput> {
    const { id, userId, organizationId } = input;

    const existing = await this.repository.findById(id, organizationId);
    if (!existing) {
      throw new ApplicationNotFoundError('Property not found');
    }

    if ((existing.hostId as string) !== userId) {
      throw new ApplicationForbiddenError(
        'You can only publish your own properties',
      );
    }

    const property = await this.repository.publish(id);
    return { property };
  }
}
