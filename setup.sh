#!/bin/bash

# Exit on error
set -e

echo "🚀 Setting up Streaming Platform..."

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check and install Docker if needed
if ! command_exists docker; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com -o get-docker.sh
  sudo sh get-docker.sh
  sudo usermod -aG docker $USER
  rm get-docker.sh
fi

# Check and install Docker Compose if needed
if ! command_exists docker-compose; then
  echo "Installing Docker Compose..."
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

# Install pnpm
if ! command_exists pnpm; then
  echo "Installing pnpm..."
  npm install -g pnpm@8.15.3
fi

# Clean up any existing containers and volumes
echo "Cleaning up existing containers and volumes..."
docker-compose down -v 2>/dev/null || true
docker system prune -f 2>/dev/null || true

# Create necessary directories
mkdir -p apps/web/.next
mkdir -p apps/api/dist
mkdir -p apps/streaming/tmp

# Set correct permissions
chmod -R 777 apps/web/.next
chmod -R 777 apps/api/dist
chmod -R 777 apps/streaming/tmp

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Generate Prisma client
echo "Generating Prisma client..."
cd apps/api && npx prisma generate && cd ../..

# Build the application
echo "Building the application..."
pnpm build

# Start the services
echo "Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
for i in {1..30}; do
  if curl -s http://localhost:3000 >/dev/null; then
    echo "✅ Frontend is ready!"
    break
  fi
  echo "Waiting for frontend to be ready... ($i/30)"
  sleep 2
done

for i in {1..30}; do
  if curl -s http://localhost:4000/health >/dev/null; then
    echo "✅ Backend is ready!"
    break
  fi
  echo "Waiting for backend to be ready... ($i/30)"
  sleep 2
done

echo "
🎉 Setup complete! The application is now running:

📱 Frontend: http://localhost:3000
🔧 API: http://localhost:4000
📊 Database Admin: http://localhost:8081
📈 Redis Commander: http://localhost:8083

To view logs:
docker-compose logs -f

To stop the application:
docker-compose down

Enjoy! 🚀"