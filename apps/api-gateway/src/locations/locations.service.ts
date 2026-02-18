import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { Prisma } from '@prisma/client';

export interface LocationSuggestion {
  id: string;
  name: string;
  city: string;
  region: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface PlaceSuggestion {
  id: string;
  name: string;
  type: string;
  description: string | null;
}

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene destinos sugeridos. Escalable: filtrar por departamento, ordenar por tendencias.
   */
  async getSuggestions(options?: {
    departmentSlug?: string;
    limit?: number;
    sortBy?: 'displayOrder' | 'trending';
  }) {
    const { departmentSlug, limit = 20, sortBy = 'displayOrder' } = options ?? {};

    const orderBy: Prisma.CityOrderByWithRelationInput[] =
      sortBy === 'trending'
        ? [{ searchCount: 'desc' }, { displayOrder: 'asc' }]
        : [{ displayOrder: 'asc' }, { name: 'asc' }];

    const cities = await this.prisma.city.findMany({
      where: {
        isActive: true,
        ...(departmentSlug && {
          department: { slug: departmentSlug, isActive: true },
        }),
      },
      include: {
        department: true,
      },
      orderBy,
      take: limit,
    });

    return cities.map((c) => ({
      id: c.id,
      name: `${c.name}, ${c.department.name}`,
      city: c.name,
      region: c.department.name,
      description: c.suggestionDescription,
      latitude: c.latitude,
      longitude: c.longitude,
    }));
  }

  /**
   * Obtiene lugares (barrios, estadios) de una ciudad.
   */
  async getPlacesByCity(citySlug: string) {
    const city = await this.prisma.city.findFirst({
      where: { slug: citySlug, isActive: true },
      include: {
        department: true,
        places: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!city) return null;

    return {
      city: {
        id: city.id,
        name: city.name,
        fullName: `${city.name}, ${city.department.name}`,
        region: city.department.name,
      },
      places: city.places.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        description: p.suggestionDescription,
      })),
    };
  }

  /**
   * Obtiene todos los departamentos activos (para escalar a más regiones).
   */
  async getDepartments() {
    return this.prisma.department.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        country: true,
      },
    });
  }

  /**
   * Registra una búsqueda para tendencias. Incrementa searchCount del city.
   */
  async logSearch(cityId: string) {
    await this.prisma.$transaction([
      this.prisma.city.update({
        where: { id: cityId },
        data: { searchCount: { increment: 1 } },
      }),
      this.prisma.locationSearchLog.create({
        data: { cityId },
      }),
    ]);
  }

  /**
   * Busca ciudades por nombre (para autocompletado).
   */
  async searchCities(query: string, limit = 10) {
    const cities = await this.prisma.city.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query.toLowerCase(), mode: 'insensitive' } },
        ],
      },
      include: { department: true },
      orderBy: [{ searchCount: 'desc' }, { displayOrder: 'asc' }],
      take: limit,
    });

    return cities.map((c) => ({
      id: c.id,
      name: `${c.name}, ${c.department.name}`,
      city: c.name,
      region: c.department.name,
    }));
  }
}
