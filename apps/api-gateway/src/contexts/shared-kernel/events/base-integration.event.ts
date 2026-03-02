export interface EventMetadata {
  eventId: string;
  traceId: string;
  occurredAt: string;
  schemaVersion: 'v1';
  correlationId: string;
  regionId?: string;
  tenantId?: string;
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

export function assertVersion(version: unknown, expected: 'v1'): 'v1' {
  if (version !== expected) {
    throw new Error(`Invalid event version: expected ${expected}`);
  }
  return expected;
}

export function assertMetadata(metadata: unknown): EventMetadata {
  const m = metadata as Record<string, unknown>;
  return {
    eventId: assertString(m.eventId, 'metadata.eventId'),
    traceId: assertString(m.traceId, 'metadata.traceId'),
    occurredAt: assertString(m.occurredAt, 'metadata.occurredAt'),
    schemaVersion: assertVersion(m.schemaVersion, 'v1'),
    correlationId: assertString(m.correlationId, 'metadata.correlationId'),
    regionId: typeof m.regionId === 'string' ? m.regionId : undefined,
    tenantId: typeof m.tenantId === 'string' ? m.tenantId : undefined,
  };
}

export function enforceEventEnvelope(
  input: unknown,
  expectedName: string,
): Record<string, unknown> {
  const event = input as Record<string, unknown>;
  if (event.name !== expectedName) {
    throw new Error(`Invalid event name: expected ${expectedName}`);
  }
  assertVersion(event.version, 'v1');
  return event;
}
