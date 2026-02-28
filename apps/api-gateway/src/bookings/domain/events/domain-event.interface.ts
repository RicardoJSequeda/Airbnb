/**
 * DomainEvent genérico para el agregado Booking.
 * Dominio puro - sin infraestructura.
 */

export interface DomainEvent {
  aggregateId: string;
  type: string;
  occurredAt: Date;
  payload: any;
}

