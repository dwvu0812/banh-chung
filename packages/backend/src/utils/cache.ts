// Enhanced caching system with Redis support and in-memory fallback
import { createClient, RedisClientType } from 'redis';

interface CacheEntry {
  value: any;
  expiry: number;
}

interface ICacheService {
  set(key: string, value: any, ttl?: number): Promise<void>;
  get(key: string): Promise<any | null>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  size(): Promise<number>;
  invalidatePattern(pattern: string): Promise<void>;
}

class RedisCache implements ICacheService {
  private client: RedisClientType;
  private isConnected: boolean = false;
  private defaultTTL: number;

  constructor(defaultTTL: number = 300) {
    this.defaultTTL = defaultTTL;
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 1000)
      }
    });

    this.client.on('connect', () => {
      console.log('Redis cache connected');
      this.isConnected = true;
    });

    this.client.on('error', (err) => {
      console.error('Redis cache error:', err);
      this.isConnected = false;
    });

    this.client.on('end', () => {
      console.log('Redis cache disconnected');
      this.isConnected = false;
    });

    // Connect to Redis
    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      const serializedValue = JSON.stringify(value);
      const expiry = ttl || this.defaultTTL;
      await this.client.setEx(`collocation:${key}`, expiry, serializedValue);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async get(key: string): Promise<any | null> {
    if (!this.isConnected) return null;
    
    try {
      const value = await this.client.get(`collocation:${key}`);
      return value && typeof value === 'string' ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      const result = await this.client.del(`collocation:${key}`);
      return result > 0;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  }

  async clear(): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      const keys = await this.client.keys('collocation:*');
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }

  async has(key: string): Promise<boolean> {
    if (!this.isConnected) return false;
    
    try {
      const exists = await this.client.exists(`collocation:${key}`);
      return exists > 0;
    } catch (error) {
      console.error('Redis has error:', error);
      return false;
    }
  }

  async size(): Promise<number> {
    if (!this.isConnected) return 0;
    
    try {
      const keys = await this.client.keys('collocation:*');
      return keys.length;
    } catch (error) {
      console.error('Redis size error:', error);
      return 0;
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.isConnected) return;
    
    try {
      const keys = await this.client.keys(`collocation:${pattern}`);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      console.error('Redis invalidatePattern error:', error);
    }
  }
}

class MemoryCache implements ICacheService {
  private cache: Map<string, CacheEntry>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 300) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
    
    // Clean up expired entries every 10 minutes
    setInterval(() => {
      this.clearExpired();
    }, 10 * 60 * 1000);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const expiry = Date.now() + (ttl || this.defaultTTL) * 1000;
    this.cache.set(key, { value, expiry });
  }

  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  private clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Cache service with fallback strategy
class CacheService {
  private primaryCache: ICacheService;
  private fallbackCache: ICacheService;
  private useRedis: boolean;

  constructor() {
    this.useRedis = process.env.NODE_ENV === 'production' && Boolean(process.env.REDIS_URL);
    this.primaryCache = this.useRedis ? new RedisCache() : new MemoryCache();
    this.fallbackCache = new MemoryCache();
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.primaryCache.set(key, value, ttl);
      // Also set in fallback for redundancy
      if (this.useRedis) {
        await this.fallbackCache.set(key, value, ttl);
      }
    } catch (error) {
      console.error('Cache set error:', error);
      // Fallback to memory cache
      await this.fallbackCache.set(key, value, ttl);
    }
  }

  async get(key: string): Promise<any | null> {
    try {
      let value = await this.primaryCache.get(key);
      if (value === null && this.useRedis) {
        // Try fallback cache
        value = await this.fallbackCache.get(key);
      }
      return value;
    } catch (error) {
      console.error('Cache get error:', error);
      return await this.fallbackCache.get(key);
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      const result = await this.primaryCache.delete(key);
      if (this.useRedis) {
        await this.fallbackCache.delete(key);
      }
      return result;
    } catch (error) {
      console.error('Cache delete error:', error);
      return await this.fallbackCache.delete(key);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.primaryCache.clear();
      if (this.useRedis) {
        await this.fallbackCache.clear();
      }
    } catch (error) {
      console.error('Cache clear error:', error);
      await this.fallbackCache.clear();
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      return await this.primaryCache.has(key);
    } catch (error) {
      console.error('Cache has error:', error);
      return await this.fallbackCache.has(key);
    }
  }

  async size(): Promise<number> {
    try {
      return await this.primaryCache.size();
    } catch (error) {
      console.error('Cache size error:', error);
      return await this.fallbackCache.size();
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      await this.primaryCache.invalidatePattern(pattern);
      if (this.useRedis) {
        await this.fallbackCache.invalidatePattern(pattern);
      }
    } catch (error) {
      console.error('Cache invalidatePattern error:', error);
      await this.fallbackCache.invalidatePattern(pattern);
    }
  }

  // Collocation-specific cache methods
  async cacheCollocations(key: string, data: any, ttl: number = 300): Promise<void> {
    await this.set(`collocations:${key}`, data, ttl);
  }

  async getCachedCollocations(key: string): Promise<any | null> {
    return await this.get(`collocations:${key}`);
  }

  async invalidateCollocationCache(pattern: string = '*'): Promise<void> {
    await this.invalidatePattern(`collocations:${pattern}`);
  }
}

// Create singleton instance
const cache = new CacheService();

export default cache;

