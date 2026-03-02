import { SetMetadata, applyDecorators } from '@nestjs/common';

export const IDEMPOTENCY_REQUIRED_KEY = 'idempotency_required';
export const IDEMPOTENCY_TTL_SECONDS_KEY = 'idempotency_ttl_seconds';

export const IdempotencyTtl = (ttlSeconds = 60 * 60) =>
  SetMetadata(IDEMPOTENCY_TTL_SECONDS_KEY, ttlSeconds);

export const RequireIdempotency = (ttlSeconds = 60 * 60) =>
  applyDecorators(
    SetMetadata(IDEMPOTENCY_REQUIRED_KEY, true),
    IdempotencyTtl(ttlSeconds),
  );
