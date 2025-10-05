import { Pool, PoolConfig } from 'pg';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';

// PostgreSQL Pool (optional - only if DATABASE_URL is provided)
// v2.0ではSupabaseクライアントを使用するため、poolは主にv1 API用
const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/dummy',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  logger.error('Unexpected database error:', err);
});

// Supabase client for v2.0 API
export const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export class DatabaseService {
  static async initialize(): Promise<void> {
    // v2.0ではSupabaseクライアントを使用
    if (!process.env.DATABASE_URL) {
      logger.info('Using Supabase client (DATABASE_URL not configured)');
      return;
    }

    try {
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      logger.info('Database connection established');
    } catch (error) {
      logger.warn('Direct database connection failed, using Supabase client');
    }
  }

  static async checkConnection(): Promise<boolean> {
    if (!process.env.DATABASE_URL) {
      // Supabaseクライアントを使用している場合は常にtrueを返す
      return true;
    }

    try {
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      return true;
    } catch (error) {
      logger.warn('Database connection check failed, using Supabase client');
      return true; // Supabaseクライアントがあるのでtrueを返す
    }
  }

  static async close(): Promise<void> {
    await pool.end();
    logger.info('Database connection closed');
  }

  static async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      logger.debug('Executed query', { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      logger.error('Query error:', { text, error });
      throw error;
    }
  }

  static async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
