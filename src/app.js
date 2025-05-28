// src/app.js
import Fastify from 'fastify';
import dotenv from 'dotenv';
import { sharedSchemas } from './schemas/common.js';
import registerRoutes from './routes/register.js';
import magicLinkRoutes from './routes/magicLink.js';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import cors from '@fastify/cors';
import jwt from 'fastify-jwt';

dotenv.config();

export async function buildApp() {
  const app = Fastify({ logger: true });

  // ✅ Register shared schemas before Swagger or routes
  for (const schema of sharedSchemas) {
    app.addSchema(schema);
  }

  await app.register(fastifySwagger, {
    openapi: {
      info: { title: 'Casazium Auth API', version: '1.0.0' },
      tags: [{ name: 'Auth', description: 'Authentication routes' }],
    },
  });

  await app.register(fastifySwaggerUi, { routePrefix: '/docs' });
  app.register(cors);
  app.register(jwt, { secret: process.env.JWT_SECRET });
  app.register(registerRoutes);
  app.register(magicLinkRoutes);

  // ✅ Custom error handler for validation errors and others
  app.setErrorHandler((err, request, reply) => {
    if (err.validation) {
      return reply.status(400).send({
        success: false,
        message: err.message || 'Validation failed',
      });
    }

    request.log.error(err);
    reply.status(500).send({
      success: false,
      message: 'Internal server error',
    });
  });

  return app;
}
