// ============================================================================
// BESS Site Survey System v2.0 - Monitoring Routes
// ============================================================================

import { Router, Request, Response } from 'express';
import { getMetricsSummary, getHealthStatus, resetMetrics } from '../middleware/monitoring';
import { cacheService } from '../services/cache.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * ヘルスチェックエンドポイント
 * GET /api/monitoring/health
 */
router.get('/health', (req: Request, res: Response) => {
  const health = getHealthStatus();
  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 503 : 500;
  
  res.status(statusCode).json({
    ...health,
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * メトリクス取得エンドポイント
 * GET /api/monitoring/metrics
 */
router.get('/metrics', (req: Request, res: Response) => {
  try {
    const metrics = getMetricsSummary();
    res.json(metrics);
  } catch (error) {
    logger.error('Error getting metrics:', error);
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

/**
 * システム情報取得エンドポイント
 * GET /api/monitoring/system
 */
router.get('/system', (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  res.json({
    node: {
      version: process.version,
      platform: process.platform,
      arch: process.arch
    },
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      }
    },
    cache: {
      enabled: cacheService.isReady(),
      type: process.env.REDIS_URL ? 'redis' : 'none'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * メトリクスリセットエンドポイント（管理者のみ）
 * POST /api/monitoring/metrics/reset
 */
router.post('/metrics/reset', (req: Request, res: Response) => {
  try {
    resetMetrics();
    logger.info('Metrics reset by admin');
    res.json({ message: 'Metrics reset successfully' });
  } catch (error) {
    logger.error('Error resetting metrics:', error);
    res.status(500).json({ error: 'Failed to reset metrics' });
  }
});

/**
 * Prometheus形式のメトリクス出力
 * GET /api/monitoring/metrics/prometheus
 */
router.get('/metrics/prometheus', (req: Request, res: Response) => {
  const metrics = getMetricsSummary();
  
  let output = '';
  
  // リクエスト総数
  output += `# HELP bess_requests_total Total number of requests\n`;
  output += `# TYPE bess_requests_total counter\n`;
  output += `bess_requests_total ${metrics.requests.total}\n\n`;
  
  // 成功リクエスト数
  output += `# HELP bess_requests_success Total number of successful requests\n`;
  output += `# TYPE bess_requests_success counter\n`;
  output += `bess_requests_success ${metrics.requests.success}\n\n`;
  
  // エラーリクエスト数
  output += `# HELP bess_requests_error Total number of error requests\n`;
  output += `# TYPE bess_requests_error counter\n`;
  output += `bess_requests_error ${metrics.requests.error}\n\n`;
  
  // 平均レスポンスタイム
  output += `# HELP bess_response_time_avg Average response time in milliseconds\n`;
  output += `# TYPE bess_response_time_avg gauge\n`;
  output += `bess_response_time_avg ${metrics.performance.avgResponseTime}\n\n`;
  
  // P95レスポンスタイム
  output += `# HELP bess_response_time_p95 95th percentile response time in milliseconds\n`;
  output += `# TYPE bess_response_time_p95 gauge\n`;
  output += `bess_response_time_p95 ${metrics.performance.p95ResponseTime}\n\n`;
  
  // エラー総数
  output += `# HELP bess_errors_total Total number of errors\n`;
  output += `# TYPE bess_errors_total counter\n`;
  output += `bess_errors_total ${metrics.errors.total}\n\n`;
  
  res.set('Content-Type', 'text/plain');
  res.send(output);
});

export default router;
