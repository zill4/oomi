#!/bin/bash

# Ensure script stops on first error
set -e

# Source the environment variables
if [ ! -f .env.production ]; then
    echo "❌ .env.production file not found!"
    exit 1
fi

# Export all variables from .env.production
set -a
source .env.production
set +a

echo "🧹 Running cleanup script..."
./scripts/clean-build.sh

echo "🧹 Cleaning up old containers..."
docker-compose -f docker-compose.prod.yml down -v

echo "🏗️ Building production images..."
DOCKER_BUILDKIT=1 docker-compose -f docker-compose.prod.yml build --parallel --no-cache

echo "🚀 Starting production stack..."
docker-compose -f docker-compose.prod.yml up -d

echo "📋 Checking backend logs..."
docker-compose -f docker-compose.prod.yml logs backend -f &

echo "⏳ Waiting for services to be healthy..."
while ! docker-compose -f docker-compose.prod.yml ps | grep backend | grep "healthy"; do
    echo "Waiting for backend to be healthy..."
    sleep 5
done

echo "🔍 Running database migrations..."
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

echo "🔍 Checking container status..."
docker-compose -f docker-compose.prod.yml ps

echo "📋 Viewing logs..."
docker-compose -f docker-compose.prod.yml logs -f 