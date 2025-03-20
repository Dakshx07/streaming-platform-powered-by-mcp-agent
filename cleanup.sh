#!/bin/bash

# Exit on error
set -e

echo "🧹 Cleaning up the environment..."

# Stop all containers
echo "Stopping containers..."
docker-compose down

# Remove all containers
echo "Removing containers..."
docker rm -f $(docker ps -aq) 2>/dev/null || true

# Remove all volumes
echo "Removing volumes..."
docker volume rm $(docker volume ls -q) 2>/dev/null || true

# Clean Docker system
echo "Cleaning Docker system..."
docker system prune -af --volumes

# Remove node_modules
echo "Removing node_modules..."
rm -rf node_modules
rm -rf apps/web/node_modules
rm -rf apps/api/node_modules

# Remove build artifacts
echo "Removing build artifacts..."
rm -rf apps/web/.next
rm -rf apps/api/dist
rm -rf apps/web/.turbo
rm -rf apps/api/.turbo

# Remove environment files
echo "Removing environment files..."
rm -f .env
rm -f apps/web/.env
rm -f apps/api/.env

# Remove Prisma generated files
echo "Removing Prisma generated files..."
rm -rf apps/api/prisma/migrations
rm -rf apps/api/prisma/*.db
rm -rf apps/api/prisma/generated

echo "✨ Cleanup complete! Run setup.sh to start fresh."