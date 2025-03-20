# Streaming Platform

A modern streaming platform built with Next.js, Node.js, and NGINX RTMP.

## Prerequisites

- Node.js >= 18
- Docker and Docker Compose
- pnpm >= 8.15.3

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/Dakshx07/streaming-platform-powered-by-mcp-agent.git
cd streaming-platform-powered-by-mcp-agent
```

2. Run the setup script:
```bash
# Make the script executable
chmod +x scripts/setup-dev.sh

# Run the setup
./scripts/setup-dev.sh
```

The setup script will:
- Install dependencies
- Set up environment files
- Generate Prisma client
- Build packages
- Start the development environment

## Manual Setup

If you prefer to set up manually:

1. Install dependencies:
```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install project dependencies
pnpm install
```

2. Set up environment variables:
```bash
# Root
cp .env.example .env

# Frontend
cp apps/web/.env.example apps/web/.env

# Backend
cp apps/api/.env.example apps/api/.env
```

3. Generate Prisma client:
```bash
cd apps/api
npx prisma generate
cd ../..
```

4. Build packages:
```bash
pnpm build
```

5. Start the development environment:
```bash
docker-compose up -d
```

## Accessing the Application

- Frontend: http://localhost:3000
- API: http://localhost:4000
- Database Admin: http://localhost:8081
- Redis Commander: http://localhost:8083

## Development

### Project Structure

```
.
├── apps/
│   ├── web/          # Next.js frontend
│   ├── api/          # Node.js backend
│   └── streaming/    # NGINX RTMP configuration
├── packages/         # Shared packages
├── scripts/         # Development scripts
├── docker-compose.yml
└── package.json
```

### Available Scripts

- `pnpm dev`: Start development environment
- `pnpm build`: Build all applications
- `pnpm lint`: Run linting
- `pnpm format`: Format code
- `pnpm clean`: Clean build artifacts

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check if ports are in use
   lsof -i :3000
   lsof -i :4000
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

2. **Database Connection Issues**
   ```bash
   # Reset the database
   docker-compose down -v
   docker-compose up
   ```

3. **Node Modules Issues**
   ```bash
   # Clean and reinstall
   pnpm clean
   rm -rf node_modules
   pnpm install
   ```

4. **Docker Issues**
   ```bash
   # Full reset
   docker-compose down -v
   docker system prune -f
   docker-compose up --build
   ```

### Viewing Logs

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f web    # Frontend
docker-compose logs -f api    # Backend
docker-compose logs -f nginx  # Streaming server
```

### Health Checks

```bash
# Check service health
docker-compose ps

# Check specific endpoints
curl http://localhost:3000/health  # Frontend
curl http://localhost:4000/health  # Backend
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT