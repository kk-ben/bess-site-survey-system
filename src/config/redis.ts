import { createClient, RedisClientType } from 'redis';
import { logger } from '@/utils/logger';

let redisClient: RedisClientType | null = null;

export class CacheService {
  private static client: RedisClientType | null = null;
  private static isConnected: boolean = false;

  static async initialize(): Promise<void> {
    // Skip Redis if URL is not provided or is a dummy value
    if (!process.env.REDIS_URL || process.env.REDIS_URL.includes('dummy')) {
      logger.warn('Redis URL not configured or is dummy - running without cache');
      this.isConnected = false;
      return;
    }

    try {
      this.client = createClient({
        url: process.env.REDIS_URL,
      });

      this.client.on('error', (err) => {
        logger.error('Redis error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis connected');
        this.isConnected = true;
      });

      await this.client.connect();
      redisClient = this.client;
      this.isConnected = true;
    } catch (error) {
      logger.warn('Failed to connect to Redis - running without cache:', error);
      this.isConnected = false;
      this.client = null;
    }
  }

  static async get(key: string): Promise<string | null> {
    if (!this.isConnected || !this.client) return null;
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET error:', { key, error });
      return null;
    }
  }

  static async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error('Redis SET error:', { key, error });
    }
  }

  static async del(key: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis DEL error:', { key, error });
    }
  }

  static async ping(): Promise<boolean> {
    if (!this.isConnected || !this.client) return false;
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis PING error:', error);
      return false;
    }
  }

  static async close(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      logger.info('Redis connection closed');
    }
  }
}
