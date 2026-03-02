import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface TraceContext {
  traceId: string;
  correlationId: string;
}

@Injectable()
export class TraceContextService {
  private readonly storage = new AsyncLocalStorage<TraceContext>();

  run<T>(context: TraceContext, fn: () => T): T {
    return this.storage.run(context, fn);
  }

  getTraceId(): string {
    return this.storage.getStore()?.traceId ?? 'trace-missing';
  }

  getCorrelationId(): string {
    return this.storage.getStore()?.correlationId ?? 'correlation-missing';
  }
}
