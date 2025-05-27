// index.js
import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import jwt from 'fastify-jwt';
import registerRoutes from './src/routes/register.js';
import magicLinkRoutes from './src/routes/magicLink.js';

// Load environment variables
dotenv.config();

// Create Fastify app
const app = Fastify({ logger: true });

// Register plugins
app.register(cors);
app.register(jwt, { secret: process.env.JWT_SECRET });

// Register routes
app.register(registerRoutes);
app.register(magicLinkRoutes);

// Health check
app.get('/', async (request, reply) => {
  return { message: 'Casazium Auth API is running' };
});

// Start server
const start = async () => {
  try {
    await app.listen({
      port: Number(process.env.PORT) || 3000,
      host: '0.0.0.0',
    });
    console.log(
      `Server running at http://localhost:${process.env.PORT || 3000}`
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
