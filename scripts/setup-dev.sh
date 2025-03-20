#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up development environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Copy environment files if they don't exist
if [ ! -f .env ]; then
    echo "📄 Creating .env file..."
    cp .env.example .env
fi

if [ ! -f apps/web/.env ]; then
    echo "📄 Creating web .env file..."
    cp apps/web/.env.example apps/web/.env
fi

if [ ! -f apps/api/.env ]; then
    echo "📄 Creating api .env file..."
    cp apps/api/.env.example apps/api/.env
fi

# Generate Prisma client
echo "🔨 Generating Prisma client..."
cd apps/api && npx prisma generate && cd ../..

# Build packages
echo "🏗️ Building packages..."
pnpm build

# Start development environment
echo "🚀 Starting development environment..."
docker-compose up -d

echo "✅ Development environment setup complete!"
echo "
📝 Next steps:
1. Frontend: http://localhost:3000
2. API: http://localhost:4000
3. Database Admin: http://localhost:8081
4. Redis Commander: http://localhost:8083

To view logs:
- Frontend: docker-compose logs -f web
- Backend: docker-compose logs -f api

To stop the environment:
- docker-compose down"