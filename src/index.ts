import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';

dotenv.config();

import { errorHandler, notFoundHandler } from '@/middleware/errorHandler';
import { generalLimiter } from '@/middleware/rateLimiter';
import { DatabaseService } from '@/config/database';
import { CacheService } from '@/config/redis';
import { logger } from '@/utils/logger';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        scriptSrc: ["'self'", 'https://maps.googleapis.com'],
        connectSrc: ["'self'", 'https://maps.googleapis.com'],
      },
    },
  })
);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [
  'http://localhost:3000',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(generalLimiter);

// Health check
app.get('/health', async (req, res) => {
  const dbHealthy = await DatabaseService.checkConnection();
  const cacheHealthy = await CacheService.ping();

  const status = dbHealthy && cacheHealthy ? 'healthy' : 'unhealthy';
  const statusCode = status === 'healthy' ? 200 : 503;

  res.status(statusCode).json({
    status,
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealthy ? 'connected' : 'disconnected',
      cache: cacheHealthy ? 'connected' : 'disconnected',
    },
    uptime: process.uptime(),
  });
});

// Import routes
import authRoutes from '@/routes/auth.routes';
import userRoutes from '@/routes/user.routes';
import siteRoutes from '@/routes/site.routes';
import importRoutes from '@/routes/import.routes';
import evaluationRoutes from '@/routes/evaluation.routes';
import screeningRoutes from '@/routes/screening.routes';

// v2.0 routes
import { siteRoutesV2 } from '@/routes/v2/site.routes';
import { automationRoutesV2 } from '@/routes/v2/automation.routes';
import importRoutesV2 from '@/routes/v2/import.routes';

// API routes
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'BESS Site Survey System API',
    version: '1.0.0',
    status: 'running',
  });
});

app.get('/api/v2', (req, res) => {
  res.json({
    message: 'BESS Site Survey System API v2.0',
    version: '2.0.0',
    status: 'running',
    features: [
      'Enhanced data model with automation tracking',
      'Audit log support',
      'Score history tracking',
      'Initial job automation'
    ]
  });
});

// v1 API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/sites', siteRoutes);
app.use('/api/v1/import', importRoutes);
app.use('/api/v1/evaluations', evaluationRoutes);
app.use('/api/v1/screening', screeningRoutes);

// v2.0 API routes
app.use('/api/v2/sites', siteRoutesV2);
app.use('/api/v2/automation', automationRoutesV2);
app.use('/api/v2/import', importRoutesV2);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize services and start server
async function startServer(): Promise<void> {
  try {
    await DatabaseService.initialize();
    logger.info('Database connection established');

    await CacheService.initialize();
    const cacheStatus = await CacheService.ping();
    logger.info(`Cache service initialized: ${cacheStatus ? 'Connected' : 'Disabled'}`);

    server.listen(PORT, () => {
      logger.info(`🚀 BESS Site Survey System API running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🗄️  Database: Connected`);
      logger.info(`🔄 Cache: ${cacheStatus ? 'Connected' : 'Disabled'}`);
    });

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    try {
      await DatabaseService.close();
      await CacheService.close();
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  });
}

startServer().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

export { app, server };
