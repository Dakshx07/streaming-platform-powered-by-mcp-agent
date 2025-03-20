import { Server, Socket } from 'socket.io';
import { verifyToken } from '../lib/jwt';
import { redis } from '../lib/redis';
import { logger } from '../lib/logger';

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    username: string;
    isModerator: boolean;
  };
}

export const setupWebSocket = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const user = await verifyToken(token);
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join chat room
    socket.on('join-chat', async (channelId: string) => {
      try {
        const room = `chat:${channelId}`;
        await socket.join(room);

        // Get recent messages
        const messages = await redis.lrange(`messages:${channelId}`, 0, 49);
        socket.emit('chat-history', messages.map(msg => JSON.parse(msg)));

        // Notify channel about new viewer
        io.to(room).emit('viewer-joined', {
          userId: socket.user?.id,
          username: socket.user?.username,
        });
      } catch (error) {
        logger.error('Error joining chat:', error);
        socket.emit('chat-error', 'Failed to join chat');
      }
    });

    // Leave chat room
    socket.on('leave-chat', (channelId: string) => {
      const room = `chat:${channelId}`;
      socket.leave(room);
      io.to(room).emit('viewer-left', {
        userId: socket.user?.id,
        username: socket.user?.username,
      });
    });

    // Handle chat messages
    socket.on('send-message', async (data: {
      channelId: string;
      content: string;
    }) => {
      try {
        if (!socket.user) {
          throw new Error('Authentication required');
        }

        const { channelId, content } = data;
        const room = `chat:${channelId}`;

        // Create message object
        const message = {
          id: `msg_${Date.now()}`,
          content,
          userId: socket.user.id,
          username: socket.user.username,
          isModerator: socket.user.isModerator,
          createdAt: new Date().toISOString(),
        };

        // Store message in Redis
        await redis.lpush(
          `messages:${channelId}`,
          JSON.stringify(message)
        );
        await redis.ltrim(`messages:${channelId}`, 0, 99); // Keep last 100 messages

        // Broadcast message to room
        io.to(room).emit('chat-message', message);
      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('chat-error', 'Failed to send message');
      }
    });

    // Handle stream events
    socket.on('stream-start', async (data: { channelId: string }) => {
      try {
        const { channelId } = data;
        const room = `stream:${channelId}`;
        
        await socket.join(room);
        io.to(room).emit('stream-started', {
          channelId,
          startedAt: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Error starting stream:', error);
        socket.emit('stream-error', 'Failed to start stream');
      }
    });

    socket.on('stream-end', async (data: { channelId: string }) => {
      try {
        const { channelId } = data;
        const room = `stream:${channelId}`;
        
        io.to(room).emit('stream-ended', {
          channelId,
          endedAt: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Error ending stream:', error);
        socket.emit('stream-error', 'Failed to end stream');
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};