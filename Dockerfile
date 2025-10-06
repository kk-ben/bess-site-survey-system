# ============================================================================
# BESS Site Survey System v2.0 - Optimized Multi-stage Dockerfile
# ============================================================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY src ./src

# Build TypeScript with optimizations
RUN npm run build

# Remove devDependencies
RUN npm prune --production

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache \
    tini \
    curl \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Create necessary directories with proper permissions
RUN mkdir -p uploads logs tmp && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check with improved reliability
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start application with production optimizations
CMD ["node", "--max-old-space-size=2048", "--optimize-for-size", "dist/index.js"]
