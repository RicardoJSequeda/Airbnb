import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import {
  IDEMPOTENCY_REQUIRED_KEY,
  IDEMPOTENCY_TTL_SECONDS_KEY,
} from '../../common/decorators/idempotency.decorator';
import { IdempotencyService } from './idempotency.service';

interface RequestWithHeaders {
  method: string;
  route?: { path?: string };
  path?: string;
  headers?: Record<string, string | string[] | undefined>;
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
    const header = request.headers?.['x-idempotency-key'];
    const key = typeof header === 'string' ? header.trim() : '';

    if (!key) {
      throw new BadRequestException(
        'x-idempotency-key header is required for this operation',
      );
    }

    const ttlSeconds =
      this.reflector.getAllAndOverride<number>(IDEMPOTENCY_TTL_SECONDS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 3600;

    const path = request.route?.path ?? request.path ?? 'unknown-path';

    return from(
      this.idempotency.register(request.method, path, key, ttlSeconds),
    ).pipe(
      mergeMap((accepted) => {
        if (!accepted) {
          throw new ConflictException('Duplicate idempotent request detected');
        }

        return next.handle();
      }),
    );
  }
}
