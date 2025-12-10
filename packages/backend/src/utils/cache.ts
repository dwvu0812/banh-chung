// Simple in-memory cache implementation
// For production, consider using Redis

interface CacheEntry {
  value: any;
  expiry: number;
}

class Cache {
  private cache: Map<string, CacheEntry>;
  private defaultTTL: number; // Time to live in seconds

  constructor(defaultTTL: number = 300) {
    // Default 5 minutes
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  // Set a value in cache with optional TTL
  set(key: string, value: any, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTTL) * 1000;
    this.cache.set(key, { value, expiry });
  }

  // Get a value from cache
  get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  // Delete a specific key
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Clear expired entries
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    const value = this.get(key);
    return value !== null;
  }
}

// Create singleton instance
const cache = new Cache();

// Clean up expired entries every 10 minutes
setInterval(() => {
  cache.clearExpired();
}, 10 * 60 * 1000);

export default cache;

