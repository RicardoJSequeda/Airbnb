/**
 * Puerto de salida para persistencia de propiedades.
 * Dominio/Application no importan Prisma.
 */

export type FormattedProperty = Record<string, unknown>;

export interface CreatePropertyData {
  title: string;
  description: string;
  price: number;
  currency?: string;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  propertyType: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  images: string[];
  hostId: string;
  organizationId: string;
}

export interface UpdatePropertyData {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  maxGuests?: number;
  bedrooms?: number;
  bathrooms?: number;
  propertyType?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  amenities?: string[];
  images?: string[];
}

export interface ListPropertiesFilters {
  city?: string;
  country?: string;
  propertyType?: string;
  organizationId?: string | null;
}

export interface ListPublicPropertiesFilters {
  city?: string;
  country?: string;
  propertyType?: string;
}

export interface IPropertiesRepository {
  create(data: CreatePropertyData): Promise<FormattedProperty>;

  findById(
    id: string,
    organizationId?: string | null,
  ): Promise<FormattedProperty | null>;

  findMany(filters: ListPropertiesFilters): Promise<FormattedProperty[]>;

  update(id: string, data: UpdatePropertyData): Promise<FormattedProperty>;

  delete(id: string): Promise<void>;

  publish(id: string): Promise<FormattedProperty>;

  findManyPublic(
    filters: ListPublicPropertiesFilters,
  ): Promise<FormattedProperty[]>;

  findOnePublic(id: string): Promise<FormattedProperty>;
}
