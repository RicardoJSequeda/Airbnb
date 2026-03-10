/**
 * Caso de uso: crear propiedad.
 */

import { Inject, Injectable } from '@nestjs/common';
import type { IPropertiesRepository } from '../domain/ports/properties.repository';
import type { CreatePropertyDto } from '../dto/create-property.dto';

export interface CreatePropertyInput {
  dto: CreatePropertyDto;
  hostId: string;
  organizationId: string;
}

export interface CreatePropertyOutput {
  property: Record<string, unknown>;
}

@Injectable()
export class CreatePropertyUseCase {
  constructor(
    @Inject('IPropertiesRepository')
    private readonly repository: IPropertiesRepository,
  ) {}

  async execute(input: CreatePropertyInput): Promise<CreatePropertyOutput> {
    const { dto, hostId, organizationId } = input;
    const { amenities, images, ...rest } = dto;

    const property = await this.repository.create({
      ...rest,
      hostId,
      organizationId,
      amenities: amenities ?? [],
      images: images ?? [],
    });

    return { property };
  }
}
