#!/bin/bash
# ============================================================================
# BESS Site Survey System v2.0 - Production Deployment Script
# ============================================================================

set -e

echo "🚀 Starting BESS v2.0 Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="bess-site-survey-system"
DOCKER_IMAGE="${PROJECT_NAME}:v2.0"
CONTAINER_NAME="${PROJECT_NAME}-v2"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    if [ ! -f ".env" ]; then
        log_error ".env file not found"
        exit 1
    fi
    
    log_info "Prerequisites check passed ✓"
}

# Backup database
backup_database() {
    log_info "Creating database backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Export database
    docker-compose exec -T postgres pg_dump -U bess_user bess_survey > "$BACKUP_DIR/database.sql"
    
    # Backup uploads directory
    if [ -d "uploads" ]; then
        tar -czf "$BACKUP_DIR/uploads.tar.gz" uploads/
    fi
    
    log_info "Backup created at $BACKUP_DIR ✓"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Apply v2.0 schema
    docker-compose exec -T postgres psql -U bess_user -d bess_survey < database/migrations/002_normalized_schema.sql
    
    # Apply performance optimizations
    docker-compose exec -T postgres psql -U bess_user -d bess_survey < database/migrations/003_v2_performance_optimization.sql
    
    log_info "Migrations completed ✓"
}

# Build Docker image
build_image() {
    log_info "Building Docker image..."
    
    docker build -t "$DOCKER_IMAGE" .
    
    log_info "Docker image built ✓"
}

# Stop existing containers
stop_containers() {
    log_info "Stopping existing containers..."
    
    if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
        docker stop "$CONTAINER_NAME"
        docker rm "$CONTAINER_NAME"
    fi
    
    log_info "Containers stopped ✓"
}

# Start new containers
start_containers() {
    log_info "Starting new containers..."
    
    docker-compose up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 10
    
    # Check health
    if docker-compose ps | grep -q "Up"; then
        log_info "Containers started successfully ✓"
    else
        log_error "Failed to start containers"
        exit 1
    fi
}

# Run health checks
health_check() {
    log_info "Running health checks..."
    
    max_attempts=30
    attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -f http://localhost:4000/health > /dev/null 2>&1; then
            log_info "Health check passed ✓"
            return 0
        fi
        
        attempt=$((attempt + 1))
        log_warn "Health check attempt $attempt/$max_attempts..."
        sleep 2
    done
    
    log_error "Health check failed after $max_attempts attempts"
    return 1
}

# Refresh materialized views
refresh_views() {
    log_info "Refreshing materialized views..."
    
    docker-compose exec -T postgres psql -U bess_user -d bess_survey -c "SELECT refresh_materialized_views();"
    
    log_info "Materialized views refreshed ✓"
}

# Show deployment summary
show_summary() {
    log_info "==================================="
    log_info "Deployment Summary"
    log_info "==================================="
    log_info "Project: $PROJECT_NAME"
    log_info "Version: v2.0"
    log_info "Image: $DOCKER_IMAGE"
    log_info "Backup: $BACKUP_DIR"
    log_info "Status: Running"
    log_info "==================================="
    log_info ""
    log_info "Access the application at:"
    log_info "  - API: http://localhost:4000"
    log_info "  - Frontend: http://localhost:3000"
    log_info "  - Health: http://localhost:4000/health"
    log_info ""
    log_info "View logs with:"
    log_info "  docker-compose logs -f"
}

# Rollback function
rollback() {
    log_error "Deployment failed. Rolling back..."
    
    # Stop new containers
    docker-compose down
    
    # Restore database from backup
    if [ -f "$BACKUP_DIR/database.sql" ]; then
        docker-compose exec -T postgres psql -U bess_user -d bess_survey < "$BACKUP_DIR/database.sql"
        log_info "Database restored from backup"
    fi
    
    # Restore uploads
    if [ -f "$BACKUP_DIR/uploads.tar.gz" ]; then
        tar -xzf "$BACKUP_DIR/uploads.tar.gz"
        log_info "Uploads restored from backup"
    fi
    
    log_error "Rollback completed"
    exit 1
}

# Main deployment flow
main() {
    log_info "Starting deployment process..."
    
    # Set trap for errors
    trap rollback ERR
    
    # Execute deployment steps
    check_prerequisites
    backup_database
    build_image
    stop_containers
    start_containers
    
    # Check if deployment was successful
    if health_check; then
        run_migrations
        refresh_views
        show_summary
        log_info "✅ Deployment completed successfully!"
    else
        rollback
    fi
}

# Run main function
main
