import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/authenticate';
import { validateRequest } from '../middleware/validate-request';
import { redis } from '../lib/redis';
import { generateStreamKey } from '../lib/stream';

const router = Router();

// Validation schemas
const createStreamSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
});

const updateStreamSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
});

// Get featured streams
router.get('/featured', async (req, res) => {
  try {
    const featuredStreams = await prisma.stream.findMany({
      where: {
        endedAt: null, // Only live streams
      },
      orderBy: {
        viewerCount: 'desc',
      },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        channel: {
          select: {
            id: true,
            title: true,
            category: true,
            tags: true,
          },
        },
      },
    });

    res.json({ streams: featuredStreams });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get featured streams' });
  }
});

// Get streams by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = '1', limit = '20' } = req.query;

    const streams = await prisma.stream.findMany({
      where: {
        endedAt: null,
        channel: {
          category,
        },
      },
      orderBy: {
        viewerCount: 'desc',
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        channel: {
          select: {
            id: true,
            title: true,
            category: true,
            tags: true,
          },
        },
      },
    });

    const total = await prisma.stream.count({
      where: {
        endedAt: null,
        channel: {
          category,
        },
      },
    });

    res.json({
      streams,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get streams by category' });
  }
});

// Create stream
router.post('/', authenticate, validateRequest(createStreamSchema), async (req, res) => {
  try {
    const { title, description, thumbnailUrl } = req.body;

    // Check if user already has an active stream
    const activeStream = await prisma.stream.findFirst({
      where: {
        userId: req.user.id,
        endedAt: null,
      },
    });

    if (activeStream) {
      return res.status(400).json({ error: 'You already have an active stream' });
    }

    // Get user's channel
    const channel = await prisma.channel.findUnique({
      where: { userId: req.user.id },
    });

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Create stream
    const stream = await prisma.stream.create({
      data: {
        title,
        description,
        thumbnailUrl,
        userId: req.user.id,
        channelId: channel.id,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        channel: true,
      },
    });

    // Update channel status
    await prisma.channel.update({
      where: { id: channel.id },
      data: { isLive: true },
    });

    // Generate stream key
    const streamKey = generateStreamKey(stream.id);
    await redis.set(`stream:${stream.id}:key`, streamKey);

    res.status(201).json({
      stream,
      streamKey,
      rtmpUrl: `rtmp://streaming.yourdomain.com/live`,
      playbackUrl: `https://streaming.yourdomain.com/hls/${stream.id}.m3u8`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create stream' });
  }
});

// Update stream
router.patch('/:id', authenticate, validateRequest(updateStreamSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, thumbnailUrl } = req.body;

    const stream = await prisma.stream.findUnique({
      where: { id },
    });

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    if (stream.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updatedStream = await prisma.stream.update({
      where: { id },
      data: {
        title,
        description,
        thumbnailUrl,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        channel: true,
      },
    });

    res.json({ stream: updatedStream });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stream' });
  }
});

// End stream
router.post('/:id/end', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const stream = await prisma.stream.findUnique({
      where: { id },
    });

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    if (stream.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update stream
    const endedStream = await prisma.stream.update({
      where: { id },
      data: {
        endedAt: new Date(),
        duration: Math.floor((Date.now() - stream.startedAt.getTime()) / 1000),
      },
    });

    // Update channel status
    await prisma.channel.update({
      where: { userId: req.user.id },
      data: { isLive: false, viewerCount: 0 },
    });

    // Clean up Redis
    await redis.del(`stream:${id}:key`);
    await redis.del(`stream:${id}:viewers`);

    res.json({ stream: endedStream });
  } catch (error) {
    res.status(500).json({ error: 'Failed to end stream' });
  }
});

// Get stream by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const stream = await prisma.stream.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        channel: {
          include: {
            followers: true,
          },
        },
      },
    });

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    // Get viewer count from Redis
    const viewerCount = await redis.scard(`stream:${id}:viewers`);

    res.json({
      stream: {
        ...stream,
        viewerCount: Number(viewerCount) || stream.viewerCount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get stream' });
  }
});

export default router;