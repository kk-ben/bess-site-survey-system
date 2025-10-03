import { createClient, RedisClientType } from 'redis';
import { logger } from '@/utils/logger';

let redisClient: RedisClientType | null = null;

export class CacheService {
  private static client: RedisClientType;

  static async initialize(): Promise<void> {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL,
      });

      this.client.on('error', (err) => {
        logger.error('Redis error:', err);
      });

      this.client.on('connect', () => {
        logger.info('Redis connected');
      });

      await this.client.connect();
      redisClient = this.client;
    } catch (error) {
      logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  static async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Redis GET error:', { key, error });
      return null;
    }
  }

  static async set(key: string, value: string, ttl?: number): Promise<void> {
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
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Redis DEL error:', { key, error });
    }
  }

  static async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      logger.error('Redis PING error:', error);
      return false;
    }
  }

  static async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      logger.info('Redis connection closed');
    }
  }
}
