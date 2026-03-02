import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
import { TraceContextService } from './trace-context.service';

 main

interface RequestWithHeaders {
  headers?: Record<string, string | string[] | undefined>;
  correlationId?: string;
}

interface ResponseWithHeader {
  setHeader(name: string, value: string): void;
}

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
  constructor(private readonly traceContext: TraceContextService) {}


 main
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithHeaders>();
    const response = http.getResponse<ResponseWithHeader>();

    const incoming = request.headers?.['x-correlation-id'];
    const correlationId =
      typeof incoming === 'string' && incoming.length > 0
        ? incoming
        : randomUUID();
 codex/implementar-arquitectura-hexagonal-y-ddd-8yidz5
    const traceId = randomUUID();

    request.correlationId = correlationId;
    response.setHeader('x-correlation-id', correlationId);
    response.setHeader('x-trace-id', traceId);

    return this.traceContext.run({ traceId, correlationId }, () =>
      next.handle(),
    );


    request.correlationId = correlationId;
    response.setHeader('x-correlation-id', correlationId);

    return next.handle();
 main
  }
}
