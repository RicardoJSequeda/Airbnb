/**
 * Puerto de salida para cache/locks (rate limit, lock de slot, hold).
 * Application no importa cliente Redis.
 */

export interface IRedisPort {
  isAvailable(): boolean;

  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;

  /** Lock distribuido: true si se adquirió, false si ya estaba tomado. */
  trySetNx(key: string, value: string, ttlSeconds: number): Promise<boolean>;
}
