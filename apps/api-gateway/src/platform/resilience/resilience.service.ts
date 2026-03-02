import { Injectable } from '@nestjs/common';

export interface RetryOptions {
  retries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterMs: number;
}

@Injectable()
export class ResilienceService {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    options: RetryOptions,
  ): Promise<T> {
    let attempt = 0;
    let lastError: unknown;

    while (attempt <= options.retries) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === options.retries) {
          break;
        }

        const delay = this.calculateBackoff(attempt, options);
        await this.sleep(delay);
        attempt += 1;
      }
    }

    throw lastError;
  }

  private calculateBackoff(attempt: number, options: RetryOptions): number {
    const exponential = Math.min(
      options.maxDelayMs,
      options.baseDelayMs * 2 ** attempt,
    );
    const jitter = Math.floor(Math.random() * options.jitterMs);
    return exponential + jitter;
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
