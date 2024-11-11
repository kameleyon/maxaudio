interface CacheConfig {
  maxAge: number; // Time in milliseconds
  maxSize: number; // Maximum number of items
}

interface CacheItem<T> {
  value: T;
  timestamp: number;
  key: string;
}

class CacheService {
  private cache: Map<string, CacheItem<any>>;
  private config: CacheConfig;

  constructor(config: CacheConfig = { maxAge: 5 * 60 * 1000, maxSize: 100 }) {
    this.cache = new Map();
    this.config = config;
  }

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (Date.now() - item.timestamp > this.config.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, value: T): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      key
    });
  }

  /**
   * Remove item from cache
   */
  remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if key exists in cache
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Remove expired items
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.config.maxAge) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get oldest key in cache
   */
  private getOldestKey(): string | null {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  /**
   * Wrap API call with caching
   */
  async withCache<T>(
    key: string,
    apiCall: () => Promise<T>,
    config?: Partial<CacheConfig>
  ): Promise<T> {
    // Check cache first
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Make API call
    const result = await apiCall();

    // Cache result with optional custom config
    const cacheConfig = { ...this.config, ...config };
    if (this.cache.size >= cacheConfig.maxSize) {
      const oldestKey = this.getOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value: result,
      timestamp: Date.now(),
      key
    });

    return result;
  }

  /**
   * Start automatic cleanup interval
   */
  startCleanupInterval(interval: number = 60000): void {
    setInterval(() => {
      this.cleanup();
    }, interval);
  }
}

// Create cache instances for different purposes
export const apiCache = new CacheService({ maxAge: 5 * 60 * 1000, maxSize: 100 }); // 5 minutes
export const fileCache = new CacheService({ maxAge: 30 * 60 * 1000, maxSize: 50 }); // 30 minutes
export const analyticsCache = new CacheService({ maxAge: 60 * 1000, maxSize: 20 }); // 1 minute

// Start cleanup intervals
apiCache.startCleanupInterval();
fileCache.startCleanupInterval();
analyticsCache.startCleanupInterval();
