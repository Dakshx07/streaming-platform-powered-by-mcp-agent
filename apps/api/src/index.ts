import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { config } from './config';
import { errorHandler } from './middleware/error-handler';
import { setupRoutes } from './routes';
import { setupWebSocket } from './websocket';
import { connectDatabase } from './lib/database';
import { logger } from './lib/logger';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigins,
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
}));

// Setup routes
setupRoutes(app);

// Setup WebSocket
setupWebSocket(io);

// Error handling
app.use(errorHandler);

// Start server
const start = async () => {
  try {
    await connectDatabase();
    
    httpServer.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();