import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private readonly counters = new Map<string, number>();
  private readonly gauges = new Map<string, number>();
  private readonly histograms = new Map<string, number[]>();

  inc(name: string, value = 1, labels?: Record<string, string | number>): void {
    const key = this.withLabels(name, labels);
    this.counters.set(key, (this.counters.get(key) ?? 0) + value);
  }

  setGauge(name: string, value: number, labels?: Record<string, string | number>): void {
    const key = this.withLabels(name, labels);
    this.gauges.set(key, value);
  }

  observe(name: string, value: number, labels?: Record<string, string | number>): void {
    const key = this.withLabels(name, labels);
    const bucket = this.histograms.get(key) ?? [];
    bucket.push(value);
    if (bucket.length > 5000) {
      bucket.shift();
    }
    this.histograms.set(key, bucket);
  }

  renderPrometheus(): string {
    const lines: string[] = [];

    for (const [name, value] of this.counters) {
      lines.push(`# TYPE ${name} counter`);
      lines.push(`${name} ${value}`);
    }

    for (const [name, value] of this.gauges) {
      lines.push(`# TYPE ${name} gauge`);
      lines.push(`${name} ${value}`);
    }

    for (const [name, values] of this.histograms) {
      const sorted = [...values].sort((a, b) => a - b);
      const p50 = this.percentile(sorted, 0.5);
      const p95 = this.percentile(sorted, 0.95);
      const avg = sorted.length
        ? sorted.reduce((acc, current) => acc + current, 0) / sorted.length
        : 0;

      lines.push(`# TYPE ${name}_samples gauge`);
      lines.push(`${name}_samples ${sorted.length}`);
      lines.push(`# TYPE ${name}_avg gauge`);
      lines.push(`${name}_avg ${avg}`);
      lines.push(`# TYPE ${name}_p50 gauge`);
      lines.push(`${name}_p50 ${p50}`);
      lines.push(`# TYPE ${name}_p95 gauge`);
      lines.push(`${name}_p95 ${p95}`);
    }

    return `${lines.join('\n')}\n`;
  }

  private percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    const idx = Math.min(values.length - 1, Math.floor(values.length * p));
    return values[idx] ?? 0;
  }

  private withLabels(name: string, labels?: Record<string, string | number>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }

    const parts = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${this.sanitizeLabel(key)}_${this.sanitizeLabel(String(value))}`);

    return `${name}__${parts.join('__')}`;
  }

  private sanitizeLabel(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  }
}
