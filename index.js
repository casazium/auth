import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import registerRoutes from './src/routes/register.js';
import magicLinkRoutes from './src/routes/magicLink.js';
import verifyMagicLinkRoutes from './src/routes/verifyMagicLink.js';
import { sharedSchemas } from './src/schemas/common.js';

dotenv.config();

const app = Fastify({ logger: true });

console.log('sharedSchemas:', sharedSchemas);

// ✅ Register shared schemas BEFORE Swagger or routes
for (const schema of sharedSchemas) {
  app.addSchema(schema);
}

console.log('Registered schemas:', app.getSchemas());

// ✅ Then register Swagger
await app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Casazium Auth API',
      description: 'API documentation for authentication endpoints',
      version: '1.0.0',
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication routes',
      },
    ],
  },
});

await app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
});

// Register core plugins
app.register(cors);
app.register(jwt, { secret: process.env.JWT_SECRET });

// Register routes
app.register(registerRoutes);
app.register(magicLinkRoutes);
app.register(verifyMagicLinkRoutes);

// Health check
app.get('/', async () => {
  return { message: 'Casazium Auth API is running' };
});

// Start server
const start = async () => {
  try {
    await app.after();
    await app.ready();
    console.log('Schemas after app.ready():', app.getSchemas());

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
