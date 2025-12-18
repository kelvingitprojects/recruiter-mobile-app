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

const prisma = new PrismaClient();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = Fastify();

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
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_me');
        userId = payload.sub || payload.userId || null;
        role = payload.role || null;
      }
    } catch (e) {}
    return { prisma, userId, role };
  },
  graphiql: process.env.NODE_ENV !== 'production',
});

app.get('/', async (req, reply) => {
  return { status: 'ok', message: 'Swipe Backend Running' };
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
    const PORT = process.env.PORT || 4000;
    console.log('Starting server...');
    // Simple in-memory rate limit per IP
    const buckets = new Map();
    const LIMIT = parseInt(process.env.RATE_LIMIT_MAX || '120', 10); // req/min
    const WINDOW_MS = 60 * 1000;

    app.addHook('onRequest', async (req, reply) => {
      try {
        const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
        const now = Date.now();
        const b = buckets.get(ip) || { count: 0, reset: now + WINDOW_MS };
        if (now > b.reset) {
          b.count = 0;
          b.reset = now + WINDOW_MS;
        }
        b.count += 1;
        buckets.set(ip, b);
        if (b.count > LIMIT) {
          reply.code(429).send({ error: 'Too many requests' });
        }
      } catch (e) {}
    });

    const address = await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server running at ${address}/graphql`);

    // DB Health Check
    try {
      console.log('Checking database connection...');
      await prisma.$connect();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      // Fail fast
      process.exit(1);
    }

    const shutdown = async () => {
      console.log('Shutting down...');
      await app.close();
      await prisma.$disconnect();
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('FAILED TO START:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();
