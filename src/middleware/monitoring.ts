// ============================================================================
// BESS Site Survey System v2.0 - Monitoring Middleware
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// メトリクス収集用のカウンター
export const metrics = {
  requests: {
    total: 0,
    success: 0,
    error: 0,
    byEndpoint: new Map<string, number>(),
    byMethod: new Map<string, number>(),
    byStatusCode: new Map<number, number>()
  },
  performance: {
    responseTimes: [] as number[],
    slowRequests: [] as { path: string; method: string; duration: number; timestamp: Date }[]
  },
  errors: {
    total: 0,
    byType: new Map<string, number>(),
    recent: [] as { error: string; path: string; timestamp: Date }[]
  }
};

/**
 * リクエストメトリクス収集ミドルウェア
 */
export function requestMetrics(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  // リクエストカウント
  metrics.requests.total++;
  
  // エンドポイント別カウント
  const endpoint = `${req.method} ${req.path}`;
  metrics.requests.byEndpoint.set(
    endpoint,
    (metrics.requests.byEndpoint.get(endpoint) || 0) + 1
  );

  // メソッド別カウント
  metrics.requests.byMethod.set(
    req.method,
    (metrics.requests.byMethod.get(req.method) || 0) + 1
  );

  // レスポンス完了時の処理
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // レスポンスタイム記録
    metrics.performance.responseTimes.push(duration);
    
    // 最新100件のみ保持
    if (metrics.performance.responseTimes.length > 100) {
      metrics.performance.responseTimes.shift();
    }

    // 遅いリクエストの記録（1秒以上）
    if (duration > 1000) {
      metrics.performance.slowRequests.push({
        path: req.path,
        method: req.method,
        duration,
        timestamp: new Date()
      });

      // 最新50件のみ保持
      if (metrics.performance.slowRequests.length > 50) {
        metrics.performance.slowRequests.shift();
      }

      logger.warn(`Slow request detected: ${req.method} ${req.path} (${duration}ms)`);
    }

    // ステータスコード別カウント
    metrics.requests.byStatusCode.set(
      res.statusCode,
      (metrics.requests.byStatusCode.get(res.statusCode) || 0) + 1
    );

    // 成功/エラーカウント
    if (res.statusCode >= 200 && res.statusCode < 400) {
      metrics.requests.success++;
    } else {
      metrics.requests.error++;
    }

    // ログ出力
    logger.info(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
}

/**
 * エラーメトリクス収集
 */
export function recordError(error: Error, req: Request) {
  metrics.errors.total++;

  // エラータイプ別カウント
  const errorType = error.name || 'UnknownError';
  metrics.errors.byType.set(
    errorType,
    (metrics.errors.byType.get(errorType) || 0) + 1
  );

  // 最近のエラー記録
  metrics.errors.recent.push({
    error: error.message,
    path: req.path,
    timestamp: new Date()
  });

  // 最新100件のみ保持
  if (metrics.errors.recent.length > 100) {
    metrics.errors.recent.shift();
  }
}

/**
 * メトリクスサマリー取得
 */
export function getMetricsSummary() {
  const responseTimes = metrics.performance.responseTimes;
  const avgResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    : 0;

  const sortedTimes = [...responseTimes].sort((a, b) => a - b);
  const p50 = sortedTimes[Math.floor(sortedTimes.length * 0.5)] || 0;
  const p95 = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;
  const p99 = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0;

  return {
    requests: {
      total: metrics.requests.total,
      success: metrics.requests.success,
      error: metrics.requests.error,
      successRate: metrics.requests.total > 0
        ? (metrics.requests.success / metrics.requests.total * 100).toFixed(2) + '%'
        : '0%',
      topEndpoints: Array.from(metrics.requests.byEndpoint.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([endpoint, count]) => ({ endpoint, count })),
      byMethod: Object.fromEntries(metrics.requests.byMethod),
      byStatusCode: Object.fromEntries(metrics.requests.byStatusCode)
    },
    performance: {
      avgResponseTime: Math.round(avgResponseTime),
      p50ResponseTime: Math.round(p50),
      p95ResponseTime: Math.round(p95),
      p99ResponseTime: Math.round(p99),
      slowRequests: metrics.performance.slowRequests.slice(-10)
    },
    errors: {
      total: metrics.errors.total,
      errorRate: metrics.requests.total > 0
        ? (metrics.errors.total / metrics.requests.total * 100).toFixed(2) + '%'
        : '0%',
      byType: Object.fromEntries(metrics.errors.byType),
      recent: metrics.errors.recent.slice(-10)
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * メトリクスリセット
 */
export function resetMetrics() {
  metrics.requests.total = 0;
  metrics.requests.success = 0;
  metrics.requests.error = 0;
  metrics.requests.byEndpoint.clear();
  metrics.requests.byMethod.clear();
  metrics.requests.byStatusCode.clear();
  metrics.performance.responseTimes = [];
  metrics.performance.slowRequests = [];
  metrics.errors.total = 0;
  metrics.errors.byType.clear();
  metrics.errors.recent = [];
}

/**
 * ヘルスチェック
 */
export function getHealthStatus() {
  const recentErrors = metrics.errors.recent.filter(
    e => new Date().getTime() - e.timestamp.getTime() < 60000 // 直近1分
  );

  const recentRequests = metrics.requests.total;
  const errorRate = recentRequests > 0
    ? (metrics.errors.total / recentRequests)
    : 0;

  // ヘルスステータス判定
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  const issues: string[] = [];

  if (errorRate > 0.1) {
    status = 'degraded';
    issues.push(`High error rate: ${(errorRate * 100).toFixed(2)}%`);
  }

  if (errorRate > 0.3) {
    status = 'unhealthy';
  }

  if (recentErrors.length > 10) {
    status = status === 'healthy' ? 'degraded' : status;
    issues.push(`High recent error count: ${recentErrors.length}`);
  }

  const avgResponseTime = metrics.performance.responseTimes.length > 0
    ? metrics.performance.responseTimes.reduce((a, b) => a + b, 0) / metrics.performance.responseTimes.length
    : 0;

  if (avgResponseTime > 2000) {
    status = status === 'healthy' ? 'degraded' : status;
    issues.push(`Slow average response time: ${Math.round(avgResponseTime)}ms`);
  }

  return {
    status,
    issues,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  };
}
