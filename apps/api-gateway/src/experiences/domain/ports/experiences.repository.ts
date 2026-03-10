/**
 * Puerto de salida para persistencia de experiencias.
 * Dominio/Application no importan Prisma.
 */

export type FormattedExperience = Record<string, unknown>;

export interface CreateExperienceData {
  title: string;
  description: string;
  pricePerParticipant: number;
  currency?: string;
  maxParticipants: number;
  duration: number;
  category: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
  includes?: string[];
  excludes?: string[];
  images?: string[];
  meetingPoint?: string;
  languages?: string[];
  ageRestriction?: string;
  hostId: string;
  organizationId: string;
}

export interface UpdateExperienceData {
  title?: string;
  description?: string;
  pricePerParticipant?: number;
  currency?: string;
  maxParticipants?: number;
  duration?: number;
  category?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  includes?: string[];
  excludes?: string[];
  images?: string[];
  meetingPoint?: string;
  languages?: string[];
  ageRestriction?: string;
}

export interface ListExperiencesFilters {
  city?: string;
  country?: string;
  category?: string;
  organizationId?: string | null;
  minParticipants?: number;
}

export interface ListPublicExperiencesFilters {
  city?: string;
  country?: string;
  category?: string;
  minParticipants?: number;
  listingType?: 'service' | 'experience';
}

export interface IExperiencesRepository {
  create(data: CreateExperienceData): Promise<FormattedExperience>;

  findById(
    id: string,
    organizationId?: string | null,
  ): Promise<FormattedExperience | null>;

  findMany(filters: ListExperiencesFilters): Promise<FormattedExperience[]>;

  update(
    id: string,
    data: UpdateExperienceData,
    organizationId: string,
  ): Promise<FormattedExperience>;

  delete(id: string): Promise<void>;

  publish(id: string): Promise<FormattedExperience>;

  findManyPublic(
    filters: ListPublicExperiencesFilters,
  ): Promise<FormattedExperience[]>;

  findOnePublic(id: string): Promise<FormattedExperience>;
}
