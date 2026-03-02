/**
 * DomainEvent genérico para el agregado Booking.
 * Dominio puro - sin infraestructura.
 */

export interface DomainEvent {
  eventId?: string;
  aggregateId: string;
  type: string;
  version?: 'v1';
  occurredAt: Date;
  correlationId?: string;
  payload: Record<string, unknown>;
}
