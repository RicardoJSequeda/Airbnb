import { Injectable } from '@nestjs/common';

interface IdempotencyRecord {
  key: string;
  method: string;
  path: string;
  createdAt: number;
}

@Injectable()
export class IdempotencyService {
  private readonly records = new Map<string, IdempotencyRecord>();

  private buildScope(method: string, path: string, key: string): string {
    return `${method.toUpperCase()}:${path}:${key}`;
  }

  register(method: string, path: string, key: string): boolean {
    const scope = this.buildScope(method, path, key);
    if (this.records.has(scope)) {
      return false;
    }

    this.records.set(scope, {
      key,
      method: method.toUpperCase(),
      path,
      createdAt: Date.now(),
    });
    return true;
  }
}
