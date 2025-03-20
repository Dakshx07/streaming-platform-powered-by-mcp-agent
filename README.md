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

2. Install dependencies:
```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install project dependencies
pnpm install
```

3. Set up environment variables:
```bash
# Copy the example env file
cp .env.example .env

# Edit the .env file with your values
```

4. Start the development environment:
```bash
# Using Docker (recommended)
docker-compose up

# Or start services individually
pnpm dev
```

5. Access the application:
- Frontend: http://localhost:3000
- API: http://localhost:4000
- Adminer (DB Admin): http://localhost:8081
- Redis Commander: http://localhost:8083

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Make sure ports 3000, 4000, 5432, 6379, 8080, 8081, and 8083 are available
   - Stop any conflicting services or change the ports in docker-compose.yml

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
   pnpm install
   ```

4. **Docker Issues**
   ```bash
   # Full reset
   docker-compose down -v
   docker system prune -f
   docker-compose up --build
   ```

### Checking Service Status

```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f web  # Frontend logs
docker-compose logs -f api  # Backend logs
```

## Development

### Project Structure

```
.
├── apps/
│   ├── web/          # Next.js frontend
│   ├── api/          # Node.js backend
│   └── streaming/    # NGINX RTMP configuration
├── packages/         # Shared packages
├── docker-compose.yml
└── package.json
```

### Available Scripts

- `pnpm dev`: Start development environment
- `pnpm build`: Build all applications
- `pnpm lint`: Run linting
- `pnpm format`: Format code
- `pnpm clean`: Clean build artifacts

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT