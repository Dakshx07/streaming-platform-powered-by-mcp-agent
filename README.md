# StreamHub - Modern Streaming Platform

## Overview
StreamHub is a full-fledged streaming platform that enables content creators to stream live content and viewers to watch and interact in real-time. Built with modern technologies and scalable architecture.

## Features

### For Viewers
- Live stream viewing with adaptive quality
- VOD (Video on Demand) playback
- Real-time chat with emotes and moderation
- User profiles and customization
- Content discovery and recommendations
- Channel subscriptions and notifications
- Virtual currency and donations

### For Streamers
- Professional streaming dashboard
- Real-time analytics and metrics
- Chat moderation tools
- Monetization features (subscriptions, donations)
- Custom channel pages
- Stream scheduling
- VOD management
- Multi-platform streaming

## Technology Stack

### Frontend
- Next.js 14 with App Router
- TailwindCSS for styling
- WebRTC for low-latency streaming
- Socket.io for real-time features
- Zustand for state management
- Shadcn UI components

### Backend
- Node.js with Express
- Socket.io for WebSocket connections
- PostgreSQL for relational data
- MongoDB for chat and analytics
- Redis for caching and pub/sub
- JWT for authentication

### Streaming Infrastructure
- NGINX with RTMP module
- AWS Media Services
  - MediaLive for transcoding
  - MediaStore for storage
  - CloudFront for CDN
- FFmpeg for media processing

## Project Structure
```
├── apps/
│   ├── web/                 # Frontend application
│   │   ├── src/
│   │   │   ├── app/        # Next.js pages
│   │   │   ├── components/ # React components
│   │   │   ├── hooks/     # Custom hooks
│   │   │   ├── lib/       # Utilities
│   │   │   └── styles/    # Global styles
│   ├── api/                # Backend API service
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── services/
│   └── streaming/          # RTMP server
├── packages/
│   ├── ui/                 # Shared UI components
│   ├── config/            # Shared configuration
│   └── tsconfig/          # TypeScript configuration
└── infrastructure/        # IaC and deployment
```

## Getting Started

### Prerequisites
- Node.js >= 18
- Docker and Docker Compose
- NGINX with RTMP module
- FFmpeg
- AWS Account (for production)

### Development Setup
1. Clone the repository:
```bash
git clone https://github.com/Dakshx07/streaming-platform-powered-by-mcp-agent.git
cd streaming-platform-powered-by-mcp-agent
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the development environment:
```bash
docker-compose up -d
```

5. Start the development servers:
```bash
pnpm dev
```

## Contributing
We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting pull requests.

## License
MIT License

## Support
For support and queries, please [open an issue](https://github.com/Dakshx07/streaming-platform-powered-by-mcp-agent/issues) in the repository.