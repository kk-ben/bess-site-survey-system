// ============================================================================
// BESS Site Survey System v2.0 - Performance Monitoring Middleware
// ============================================================================

import { Request, Response, NextFunction } from 'express';
import { RequestTimer, performanceMonitor } from '../utils/performance';
import { logger } from '../utils/logger';

/**
 * パフォーマンス監視ミドルウェア
 */
export const performanceMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const timer = new RequestTimer();
  const endpoint = `${req.method} ${req.path}`;

  // レスポンス完了時にメトリクスを記録
  res.on('finish', () => {
    const metrics = timer.getMetrics(endpoint);
    performanceMonitor.record(metrics);

    // 詳細ログ（開発環境のみ）
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Request completed', {
        endpoint,
        duration: metrics.duration,
        statusCode: res.statusCode,
        memoryUsed: Math.round(metrics.memory.heapUsed / 1024 / 1024) + 'MB'
      });
    }
  });

  next();
};

/**
 * パフォーマンス統計エンドポイント用ミドルウェア
 */
export const performanceStatsHandler = (
  req: Request,
  res: Response
): void => {
  const stats = performanceMonitor.getStats();
  
  res.json({
    success: true,
    data: {
      ...stats,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      timestamp: new Date()
    }
  });
};
