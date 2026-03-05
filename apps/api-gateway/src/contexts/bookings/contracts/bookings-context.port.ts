export const BOOKINGS_CONTEXT_PORT = 'BOOKINGS_CONTEXT_PORT';

export interface CreateBookingCommand {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export interface BookingContextPort {
  create(command: CreateBookingCommand, guestId: string, organizationId: string): Promise<unknown>;
  findAllByGuest(guestId: string, organizationId: string): Promise<unknown>;
  findAllByHost(hostId: string, organizationId?: string | null): Promise<unknown>;
  findOne(id: string, userId: string, organizationId?: string | null): Promise<unknown>;
  cancel(id: string, userId: string, organizationId?: string | null): Promise<unknown>;
  confirm(id: string, hostId: string, organizationId?: string | null): Promise<unknown>;
  reject(id: string, hostId: string, organizationId?: string | null): Promise<unknown>;
}
