#!/bin/bash

# BESS Site Survey System - Database Setup Script

echo "🗄️  Setting up BESS Site Survey Database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start PostgreSQL container
echo "📦 Starting PostgreSQL with PostGIS..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Run migrations
echo "🔄 Running database migrations..."
npm run migrate

echo "✅ Database setup complete!"
echo ""
echo "Database connection details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: bess_survey"
echo "  User: bess_user"
echo "  Password: bess_password"
