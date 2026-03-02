import {
  BadRequestException,
  ConflictException,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { IdempotencyService } from './idempotency.service';

interface RequestWithHeaders {
  method: string;
  route?: { path?: string };
  path?: string;
  headers?: Record<string, string | string[] | undefined>;
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly idempotency: IdempotencyService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithHeaders>();

    if (!MUTATING_METHODS.has(request.method.toUpperCase())) {
      return next.handle();
    }

    const header = request.headers?.['x-idempotency-key'];
    const key = typeof header === 'string' ? header.trim() : '';

    if (!key) {
      throw new BadRequestException(
        'x-idempotency-key header is required for mutating operations',
      );
    }

    const path = request.route?.path ?? request.path ?? 'unknown-path';
    const accepted = this.idempotency.register(request.method, path, key);

    if (!accepted) {
      throw new ConflictException('Duplicate idempotent request detected');
    }

    return next.handle();
  }
}
