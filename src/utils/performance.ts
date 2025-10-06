// ============================================================================
// BESS Site Survey System v2.0 - Performance Monitoring Utilities
// ============================================================================

import { Pool } from 'pg';
import { logger } from './logger';

export interface PerformanceMetrics {
  timestamp: Date;
  endpoint?: string;
  duration: number;
  memory: NodeJS.MemoryUsage;
  cpu?: number;
}

export interface QueryPerformance {
  query: string;
  calls: number;
  totalTime: number;
  meanTime: number;
  maxTime: number;
}

export interface TableSize {
  tableName: string;
  rowCount: number;
  totalSize: string;
  tableSize: string;
  indexesSize: string;
}

export interface IndexUsage {
  tableName: string;
  indexName: string;
  indexScans: number;
  rowsRead: number;
  rowsFetched: number;
  indexSize: string;
}

/**
 * パフォーマンスメトリクスを記録
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000;

  /**
   * メトリクスを記録
   */
  record(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // 古いメトリクスを削除
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // 遅いリクエストをログに記録
    if (metric.duration > 1000) {
      logger.warn('Slow request detected', {
        endpoint: metric.endpoint,
        duration: metric.duration,
        memory: metric.memory.heapUsed
      });
    }
  }

  /**
   * 統計情報を取得
   */
  getStats(): {
    count: number;
    avgDuration: number;
    maxDuration: number;
    minDuration: number;
    p95Duration: number;
    p99Duration: number;
  } {
    if (this.metrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        maxDuration: 0,
        minDuration: 0,
        p95Duration: 0,
        p99Duration: 0
      };
    }

    const durations = this.metrics.map(m => m.duration).sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      count: this.metrics.length,
      avgDuration: sum / durations.length,
      maxDuration: Math.max(...durations),
      minDuration: Math.min(...durations),
      p95Duration: durations[Math.floor(durations.length * 0.95)],
      p99Duration: durations[Math.floor(durations.length * 0.99)]
    };
  }

  /**
   * メトリクスをクリア
   */
  clear(): void {
    this.metrics = [];
  }
}

/**
 * データベースパフォーマンス分析
 */
export class DatabasePerformanceAnalyzer {
  constructor(private pool: Pool) {}

  /**
   * スロークエリを分析
   */
  async analyzeSlowQueries(): Promise<QueryPerformance[]> {
    try {
      const result = await this.pool.query(`
        SELECT 
          query,
          calls,
          total_exec_time as "totalTime",
          mean_exec_time as "meanTime",
          max_exec_time as "maxTime"
        FROM pg_stat_statements
        WHERE query NOT LIKE '%pg_stat_statements%'
        ORDER BY mean_exec_time DESC
        LIMIT 20
      `);

      return result.rows;
    } catch (error) {
      logger.error('Failed to analyze slow queries', { error });
      return [];
    }
  }

  /**
   * テーブルサイズを分析
   */
  async analyzeTableSizes(): Promise<TableSize[]> {
    try {
      const result = await this.pool.query(`
        SELECT 
          schemaname || '.' || tablename as "tableName",
          n_live_tup as "rowCount",
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as "totalSize",
          pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as "tableSize",
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as "indexesSize"
        FROM pg_stat_user_tables
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      `);

      return result.rows;
    } catch (error) {
      logger.error('Failed to analyze table sizes', { error });
      return [];
    }
  }

  /**
   * インデックス使用状況を分析
   */
  async analyzeIndexUsage(): Promise<IndexUsage[]> {
    try {
      const result = await this.pool.query(`
        SELECT 
          schemaname || '.' || tablename as "tableName",
          indexrelname as "indexName",
          idx_scan as "indexScans",
          idx_tup_read as "rowsRead",
          idx_tup_fetch as "rowsFetched",
          pg_size_pretty(pg_relation_size(indexrelid)) as "indexSize"
        FROM pg_stat_user_indexes
        ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC
      `);

      return result.rows;
    } catch (error) {
      logger.error('Failed to analyze index usage', { error });
      return [];
    }
  }

  /**
   * マテリアライズドビューを更新
   */
  async refreshMaterializedViews(): Promise<void> {
    try {
      await this.pool.query('SELECT refresh_materialized_views()');
      logger.info('Materialized views refreshed successfully');
    } catch (error) {
      logger.error('Failed to refresh materialized views', { error });
      throw error;
    }
  }

  /**
   * データベース統計情報を更新
   */
  async updateStatistics(): Promise<void> {
    try {
      await this.pool.query('ANALYZE');
      logger.info('Database statistics updated successfully');
    } catch (error) {
      logger.error('Failed to update database statistics', { error });
      throw error;
    }
  }

  /**
   * 包括的なパフォーマンスレポートを生成
   */
  async generatePerformanceReport(): Promise<{
    slowQueries: QueryPerformance[];
    tableSizes: TableSize[];
    indexUsage: IndexUsage[];
    timestamp: Date;
  }> {
    const [slowQueries, tableSizes, indexUsage] = await Promise.all([
      this.analyzeSlowQueries(),
      this.analyzeTableSizes(),
      this.analyzeIndexUsage()
    ]);

    return {
      slowQueries,
      tableSizes,
      indexUsage,
      timestamp: new Date()
    };
  }
}

/**
 * リクエストタイマー
 */
export class RequestTimer {
  private startTime: number;
  private startMemory: NodeJS.MemoryUsage;

  constructor() {
    this.startTime = Date.now();
    this.startMemory = process.memoryUsage();
  }

  /**
   * 経過時間を取得
   */
  getDuration(): number {
    return Date.now() - this.startTime;
  }

  /**
   * メモリ使用量の変化を取得
   */
  getMemoryDelta(): NodeJS.MemoryUsage {
    const current = process.memoryUsage();
    return {
      rss: current.rss - this.startMemory.rss,
      heapTotal: current.heapTotal - this.startMemory.heapTotal,
      heapUsed: current.heapUsed - this.startMemory.heapUsed,
      external: current.external - this.startMemory.external,
      arrayBuffers: current.arrayBuffers - this.startMemory.arrayBuffers
    };
  }

  /**
   * パフォーマンスメトリクスを取得
   */
  getMetrics(endpoint?: string): PerformanceMetrics {
    return {
      timestamp: new Date(),
      endpoint,
      duration: this.getDuration(),
      memory: process.memoryUsage()
    };
  }
}

// グローバルパフォーマンスモニター
export const performanceMonitor = new PerformanceMonitor();
