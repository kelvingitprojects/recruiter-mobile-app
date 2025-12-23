const dns = require('dns');
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  console.warn('Could not set default DNS result order to ipv4first', e);
}

const env = require('./config/env');
const logger = require('./config/logger');
const arcjet = require('@arcjet/node');
const { shield, detectBot, tokenBucket } = require('@arcjet/node');

const aj = arcjet.default({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    // Shield protects against common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Detect bots
    detectBot({
      mode: "LIVE", // Block bots. Use "DRY_RUN" to log only
      // Allow useful bots. See https://arcjet.com/bot-list
      allow: [
        "CURL", // Allow curl for testing
      ],
    }),
    // Rate limiting
    tokenBucket({
      mode: "LIVE",
      refillRate: 5, // Refill 5 tokens per interval
      interval: 10, // Interval in seconds
      capacity: 10, // Bucket capacity
    }),
  ],
});

const Fastify = require('fastify');
const mercurius = require('mercurius');
const cors = require('@fastify/cors');
const multipart = require('@fastify/multipart');
const fastifyStatic = require('@fastify/static');
const path = require('path');
const fs = require('fs');
const util = require('util');
const { pipeline } = require('stream');
const pump = util.promisify(pipeline);

const { schema } = require('./schema');
const { resolvers } = require('./resolvers');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { Server } = require('socket.io');

const prisma = new PrismaClient();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = Fastify();

app.addHook('onRequest', async (req, reply) => {
  if (!process.env.ARCJET_KEY) return; // Skip if no key
  try {
    const decision = await aj.protect(req, { requested: 1 }); // Deduct 1 token
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        reply.code(429).send({ error: "Too Many Requests" });
      } else if (decision.reason.isBot()) {
        reply.code(403).send({ error: "No bots allowed" });
      } else {
        reply.code(403).send({ error: "Forbidden" });
      }
    }
  } catch (error) {
    // Fail open if Arcjet fails
    logger.error("Arcjet error", error);
  }
});

app.register(cors, {
  origin: '*',
});

app.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

app.register(fastifyStatic, {
  root: uploadsDir,
  prefix: '/uploads/',
});

app.register(mercurius, {
  schema,
  resolvers,
  context: (request, reply) => {
    let userId = null;
    let role = null;
    try {
      const auth = request.headers.authorization || '';
      if (auth.startsWith('Bearer ')) {
        const token = auth.slice('Bearer '.length);
        const payload = jwt.verify(token, env.JWT_SECRET);
        userId = payload.sub || payload.userId || null;
        role = payload.role || null;
      }
    } catch (e) {}
    return { prisma, userId, role, app };
  },
  graphiql: env.isDev,
});

app.get('/', async (req, reply) => {
  return { status: 'ok', message: 'Swipe Backend Running' };
});

app.get('/health', async (req, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', db: 'connected', timestamp: new Date().toISOString() };
  } catch (e) {
    logger.error('Health check failed', e);
    return reply.code(503).send({ status: 'error', db: 'disconnected' });
  }
});

app.post('/upload', async (req, reply) => {
  const data = await req.file();
  if (!data) {
    return reply.status(400).send({ error: 'No file uploaded' });
  }
  const mimetype = data.mimetype || '';
  const ext = path.extname(data.filename || '').toLowerCase();

  if (!(mimetype === 'application/pdf' || ext === '.pdf')) {
    return reply.status(400).send({ error: 'Only PDF files are allowed' });
  }

  if (data.file.truncated) {
    return reply.status(413).send({ error: 'File too large' });
  }

  const baseName = path.basename(data.filename || 'file.pdf');
  const safeName = baseName.replace(/[^a-zA-Z0-9.\-_]/g, '') || 'file.pdf';
  const filename = `${Date.now()}-${safeName}`;
  const savePath = path.join(uploadsDir, filename);

  await pump(data.file, fs.createWriteStream(savePath));

  const protocol = req.protocol;
  const host = req.headers.host;
  const fileUrl = `${protocol}://${host}/uploads/${filename}`;

  return { url: fileUrl };
});

const start = async () => {
  try {
    const PORT = env.PORT;
    logger.info('Starting server...');
    // Simple in-memory rate limit per IP
    const buckets = new Map();

    await app.ready();
    const io = new Server(app.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    io.on('connection', (socket) => {
      logger.info({ socketId: socket.id }, 'Socket client connected');
      socket.on('chat:join', (conversationId) => {
        socket.join(`conv:${conversationId}`);
      });
      socket.on('chat:leave', (conversationId) => {
        socket.leave(`conv:${conversationId}`);
      });
      socket.on('chat:send', async (payload) => {
        try {
          const { conversationId, text, token } = payload || {};
          let senderId = null;
          if (token) {
            const data = jwt.verify(token, env.JWT_SECRET);
            senderId = data.sub || data.userId;
          }
          if (!senderId) return;
          const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
          if (!conv) return;
          if (![conv.userAId, conv.userBId].includes(senderId)) return;
          const msg = await prisma.message.create({ data: { conversationId, senderId, text } });
          io.to(`conv:${conversationId}`).emit('chat:message', msg);
        } catch (e) {
          logger.error('chat:send error', e);
        }
      });
      socket.on('disconnect', () => {
        // console.log('Socket client disconnected:', socket.id);
      });
    });

    // Make io accessible in requests if needed (optional)
    app.io = io;

    await app.listen({ port: PORT, host: '0.0.0.0' });
    logger.info(`Server running at http://127.0.0.1:${PORT}/graphql`);

    // Test DB connection
    logger.info('Checking database connection...');
    try {
      await prisma.$connect();
      logger.info('Database connected successfully');
    } catch (dbErr) {
      logger.error('Warning: Database connection check failed, but starting anyway:', dbErr.message);
    }
  } catch (err) {
    logger.error('FAILED TO START:', err);
    process.exit(1);
  }
};

start();
