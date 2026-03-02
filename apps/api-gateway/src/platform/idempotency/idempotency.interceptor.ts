import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from, of } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import {
  IDEMPOTENCY_REQUIRED_KEY,
  IDEMPOTENCY_TTL_SECONDS_KEY,
} from '../../common/decorators/idempotency.decorator';
import { IdempotencyService } from './idempotency.service';

interface RequestWithHeaders {
  method: string;
  route?: { path?: string };
  path?: string;
  body?: unknown;
  user?: { userId?: string };
  headers?: Record<string, string | string[] | undefined>;
}

interface ResponseLike {
  statusCode?: number;
}

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    private readonly idempotency: IdempotencyService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const required = this.reflector.getAllAndOverride<boolean>(
      IDEMPOTENCY_REQUIRED_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<RequestWithHeaders>();
    const response = context.switchToHttp().getResponse<ResponseLike>();

    const header = request.headers?.['x-idempotency-key'];
    const key = typeof header === 'string' ? header.trim() : '';

    if (!key) {
      throw new BadRequestException(
        'x-idempotency-key header is required for this operation',
      );
    }

    const actorId = request.user?.userId ?? 'anonymous';
    const tenantId =
      (request.headers?.['x-tenant-id'] as string | undefined) ?? 'default';
    const regionId =
      (request.headers?.['x-region-id'] as string | undefined) ?? 'global';
    const ttlSeconds =
      this.reflector.getAllAndOverride<number>(IDEMPOTENCY_TTL_SECONDS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 3600;

    const path = request.route?.path ?? request.path ?? 'unknown-path';
    const operation = `${request.method.toUpperCase()}:${path}`;
    const payloadHash = this.idempotency.hashPayload(request.body);

    return from(
      this.idempotency.reserve({
        actorId,
        operation,
        method: request.method,
        path,
        key,
        payloadHash,
        ttlSeconds,
        tenantId,
        regionId,
      }),
    ).pipe(
      mergeMap((result) => {
        if (result === 'payload_mismatch') {
          throw new ConflictException(
            'Idempotency key already used with a different payload',
          );
        }

        if (result === 'duplicate_pending') {
          throw new ConflictException(
            'Duplicate idempotent request in progress',
          );
        }

        if (result !== 'reserved') {
          return of(result.responseBody);
        }

        return next.handle().pipe(
          tap((body) => {
            void this.idempotency.saveResponse({
              actorId,
              method: request.method,
              path,
              key,
              responseCode: response.statusCode ?? 200,
              responseBody: body,
            });
          }),
        );
      }),
    );
  }
}
