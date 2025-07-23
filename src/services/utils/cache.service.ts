/* eslint-disable @typescript-eslint/no-explicit-any,sort-exports/sort-exports */
interface CacheOptions {
  ttlSec?: number;
  lazy?: {
    expireSec: number;
  };
}

export class CacheService {
  static readonly instance: CacheService = new CacheService();

  private readonly cache: {
    [key: string]: { created: number; value: any };
  } = {};

  private readonly pendingRequests: { [key: string]: Promise<any> | undefined } = {};

  /**
   * Retrieves a cached value if it exists and is fresh. If the cached value is stale but within
   * the lazy expiration window, it returns the stale value immediately and triggers a background
   * refresh. If the value is missing or expired beyond the lazy window, it waits for the recomputation
   * to complete before returning.
   *
   * Concurrent calls for the same key will share the same pending promise to prevent duplicate work.
   *
   * @param key The cache key.
   * @param valueFn Async function to compute the value if cache miss or refresh is needed.
   * @param options Configuration options including TTL and optional lazy expiration.
   * @returns The cached or freshly computed value, or undefined if not available.
   */
  async getOrCache<T>(key: string, valueFn: () => Promise<T>, options?: CacheOptions): Promise<T | undefined> {
    const now = Date.now();
    const ttlMs = options?.ttlSec != null ? options.ttlSec * 1000 : Infinity;
    const expireMs = options?.lazy ? options.lazy.expireSec * 1000 : ttlMs;

    const { created, value } = this.getValue<T>(key);
    const age = now - created;

    const isFresh = age < ttlMs;
    const canServeStale = options?.lazy !== undefined && age < expireMs;

    if (value !== undefined) {
      if (isFresh) {
        return value;
      }

      if (canServeStale) {
        if (!this.pendingRequests[key]) {
          this.pendingRequests[key] = valueFn();
          this.pendingRequests[key]
            .then((newValue) => this.setValue(key, newValue))
            .catch((e) => console.error(`Lazy update error for ${key}:`, e.message))
            .finally(() => {
              this.pendingRequests[key] = undefined;
            });
        }
        return value;
      }
    }

    if (this.pendingRequests[key]) {
      // Already updating: return same promise
      return this.pendingRequests[key] as Promise<T>;
    }

    // Value missing or expired: update now
    this.pendingRequests[key] = valueFn();
    try {
      const newValue = await (this.pendingRequests[key] as Promise<T>);
      this.setValue(key, newValue);
      return newValue;
    } finally {
      this.pendingRequests[key] = undefined;
    }
  }

  getOrCacheSync<T>(key: string, valueFn: () => T, options?: CacheOptions): T {
    const now = Date.now();
    const ttlMs = options?.ttlSec != null ? options.ttlSec * 1000 : Infinity;
    const { created, value } = this.getValue<T>(key);
    const age = now - created;
    const isFresh = age < ttlMs;

    if (value !== undefined && isFresh) {
      return value;
    }

    const result = valueFn();
    this.setValue(key, result);
    return result;
  }

  setValue<T>(key: string, value: T) {
    this.cache[key] = {
      created: Date.now(),
      value,
    };
  }

  getValue<T>(key: string): {
    created: number;
    value: T | undefined;
  } {
    return this.cache[key] || { created: 0, value: undefined };
  }
}

export function Cached(options?: CacheOptions, keyFn?: (...args: any[]) => string): MethodDecorator {
  return (target, propertyKey, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    const isAsync = originalMethod.constructor.name === 'AsyncFunction';

    const className = (target as any).constructor?.name || `Anonymous_${Math.random().toString(36).slice(2, 8)}`;
    const getKeyFn: (...args: any[]) => string = keyFn
      ? keyFn
      : (...args) => `${className}::${String(propertyKey)}::${JSON.stringify(args)}`;

    if (isAsync) {
      descriptor.value = function (...args: any[]) {
        const key = getKeyFn(...args);
        return CacheService.instance.getOrCache(key, () => originalMethod.apply(this, args), options);
      };
    } else {
      descriptor.value = function (...args: any[]) {
        const key = getKeyFn(...args);
        return CacheService.instance.getOrCacheSync(key, () => originalMethod.apply(this, args), options);
      };
    }
    return descriptor;
  };
}
