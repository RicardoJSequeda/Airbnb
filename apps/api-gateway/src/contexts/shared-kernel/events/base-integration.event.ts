export interface EventMetadata {
  eventId: string;
  occurredAt: string;
  correlationId: string;
  traceId?: string;
}

export interface BaseIntegrationEvent<TName extends string, TPayload> {
  name: TName;
  version: 'v1';
  metadata: EventMetadata;
  payload: TPayload;
}

export function assertString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Invalid event field: ${field}`);
  }
  return value;
}

export function assertNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Invalid event field: ${field}`);
  }
  return value;
}

export function assertMetadata(metadata: unknown): EventMetadata {
  const m = metadata as Record<string, unknown>;
  return {
    eventId: assertString(m.eventId, 'metadata.eventId'),
    occurredAt: assertString(m.occurredAt, 'metadata.occurredAt'),
    correlationId: assertString(m.correlationId, 'metadata.correlationId'),
    traceId: typeof m.traceId === 'string' ? m.traceId : undefined,
  };
}
