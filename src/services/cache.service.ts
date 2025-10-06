// ============================================================================
// BESS Site Survey System v2.0 - Cache Service
// ============================================================================

import { createClient } from 'redis';
import { logger } from '../utils/logger';

export class CacheService {
  private client: ReturnType<typeof createClient> | null = null;
  private isConnected = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      if (!process.env.REDIS_URL) {
        logger.warn('Redis URL not configured, caching disabled');
        return;
      }

      this.client = createClient({
        url: process.env.REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis reconnection failed after 10 attempts');
              return new Error('Redis reconnection failed');
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.client.on('error', (err) => {
        logger.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        logger.info('Redis Client Connected');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      logger.error('Failed to initialize Redis:', error);
      this.client = null;
    }
  }

  /**
   * キャッシュから値を取得
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (!value) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * キャッシュに値を設定
   */
  async set(key: string, value: any, ttlSeconds: number = 300): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * キャッシュから削除
   */
  async delete(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * パターンマッチでキャッシュを削除
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      await this.client.del(keys);
      return keys.length;
    } catch (error) {
      logger.error(`Cache delete pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * キャッシュをクリア
   */
  async clear(): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      await this.client.flushDb();
      return true;
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * キャッシュの存在確認
   */
  async exists(key: string): Promise<boolean> {
    if (!this.isConnected || !this.client) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * TTLを取得
   */
  async getTTL(key: string): Promise<number> {
    if (!this.isConnected || !this.client) {
      return -1;
    }

    try {
      return await this.client.ttl(key);
    } catch (error) {
      logger.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * 接続状態を確認
   */
  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * 接続を閉じる
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

// シングルトンインスタンス
export const cacheService = new CacheService();

// キャッシュキーのプレフィックス
export const CACHE_KEYS = {
  SITE: (id: string) => `site:${id}`,
  SITES_LIST: (filter: string) => `sites:list:${filter}`,
  SITE_DETAILS: (id: string) => `site:details:${id}`,
  AUTOMATION_STATS: 'automation:stats',
  SCORES: (siteId: string) => `scores:${siteId}`,
  USER: (id: string) => `user:${id}`
} as const;

// キャッシュTTL（秒）
export const CACHE_TTL = {
  SHORT: 60,        // 1分
  MEDIUM: 300,      // 5分
  LONG: 1800,       // 30分
  VERY_LONG: 3600   // 1時間
} as const;
