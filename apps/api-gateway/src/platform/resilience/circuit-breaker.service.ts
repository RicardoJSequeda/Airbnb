import { Injectable, ServiceUnavailableException } from '@nestjs/common';

type CircuitState = 'closed' | 'open' | 'half-open';

@Injectable()
export class CircuitBreakerService {
  private state: CircuitState = 'closed';
  private failures = 0;
  private openedAt?: number;

  async execute<T>(
    operation: () => Promise<T>,
    failureThreshold = 5,
    recoveryTimeMs = 10_000,
  ): Promise<T> {
    if (this.state === 'open' && this.openedAt) {
      const elapsed = Date.now() - this.openedAt;
      if (elapsed < recoveryTimeMs) {
        throw new ServiceUnavailableException('Circuit breaker is open');
      }
      this.state = 'half-open';
    }

    try {
      const result = await operation();
      this.failures = 0;
      this.state = 'closed';
      this.openedAt = undefined;
      return result;
    } catch (error) {
      this.failures += 1;
      if (this.failures >= failureThreshold) {
        this.state = 'open';
        this.openedAt = Date.now();
      }
      throw error;
    }
  }
}
