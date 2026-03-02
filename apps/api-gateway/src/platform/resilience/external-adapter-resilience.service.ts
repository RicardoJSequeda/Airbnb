import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

export interface AdapterPolicy {
  timeoutMs: number;
  retries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterMs: number;
  failureThreshold: number;
  circuitOpenMs: number;
}

interface CircuitState {
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  openedAt?: number;
}

interface AdapterMetrics {
  calls: number;
  failures: number;
  retries: number;
  timeouts: number;
  circuitOpenRejects: number;
}

@Injectable()
export class ExternalAdapterResilienceService {
  private readonly logger = new Logger(ExternalAdapterResilienceService.name);
  private readonly circuits = new Map<string, CircuitState>();
  private readonly metrics = new Map<string, AdapterMetrics>();

  getMetrics(adapterName: string): AdapterMetrics {
    return (
      this.metrics.get(adapterName) ?? {
        calls: 0,
        failures: 0,
        retries: 0,
        timeouts: 0,
        circuitOpenRejects: 0,
      }
    );
  }

  async execute<T>(
    adapterName: string,
    operation: () => Promise<T>,
    policy: AdapterPolicy,
  ): Promise<T> {
    const circuit = this.getOrCreateCircuit(adapterName);
    const metric = this.getOrCreateMetrics(adapterName);

    if (circuit.state === 'open' && circuit.openedAt) {
      const elapsed = Date.now() - circuit.openedAt;
      if (elapsed < policy.circuitOpenMs) {
        metric.circuitOpenRejects += 1;
        throw new ServiceUnavailableException(
          `${adapterName} circuit breaker is open`,
        );
      }
      circuit.state = 'half-open';
    }

    metric.calls += 1;

    let lastError: unknown;
    for (let attempt = 0; attempt <= policy.retries; attempt += 1) {
      try {
        const result = await this.withTimeout(operation(), policy.timeoutMs);
        circuit.state = 'closed';
        circuit.failures = 0;
        circuit.openedAt = undefined;
        return result;
      } catch (error) {
        lastError = error;
        metric.failures += 1;

        if (error instanceof Error && error.name === 'TimeoutError') {
          metric.timeouts += 1;
        }

        if (attempt < policy.retries) {
          metric.retries += 1;
          const delay = this.calculateBackoff(attempt, policy);
          await this.sleep(delay);
          continue;
        }
      }
    }

    circuit.failures += 1;
    if (circuit.failures >= policy.failureThreshold) {
      circuit.state = 'open';
      circuit.openedAt = Date.now();
      this.logger.warn(`Circuit opened for adapter=${adapterName}`);
    }

    throw lastError;
  }

  private getOrCreateCircuit(adapterName: string): CircuitState {
    if (!this.circuits.has(adapterName)) {
      this.circuits.set(adapterName, {
        state: 'closed',
        failures: 0,
      });
    }
    return this.circuits.get(adapterName)!;
  }

  private getOrCreateMetrics(adapterName: string): AdapterMetrics {
    if (!this.metrics.has(adapterName)) {
      this.metrics.set(adapterName, {
        calls: 0,
        failures: 0,
        retries: 0,
        timeouts: 0,
        circuitOpenRejects: 0,
      });
    }
    return this.metrics.get(adapterName)!;
  }

  private calculateBackoff(attempt: number, policy: AdapterPolicy): number {
    const exp = Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** attempt);
    const jitter = Math.floor(Math.random() * policy.jitterMs);
    return exp + jitter;
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    let timeoutRef: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutRef = setTimeout(() => {
        const timeoutError = new Error(
          `Operation timed out after ${timeoutMs}ms`,
        );
        timeoutError.name = 'TimeoutError';
        reject(timeoutError);
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    }
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
