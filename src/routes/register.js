import bcrypt from 'bcrypt';
import { createUser } from '../services/userService.js';

async function registerRoutes(fastify, options) {
  fastify.post('/register', {
    schema: {
      summary: 'Register a new user',
      description: 'Creates a new user with email and optional password',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
      },
      response: {
        201: { $ref: 'SuccessResponse#' },
        400: { $ref: 'ErrorResponse#' },
        409: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const { email, password } = request.body;

      try {
        const hashedPassword = password
          ? await bcrypt.hash(password, 10)
          : null;
        const result = await createUser(email, hashedPassword);

        if (result.success) {
          return reply
            .status(201)
            .send({ success: true, message: 'User registered' });
        } else {
          return reply.status(409).send({
            success: false,
            message: result.message || 'User already exists',
          });
        }
      } catch (err) {
        fastify.log.error('🔥 Register route error:', err);
        return reply
          .status(500)
          .send({ success: false, message: 'Internal server error' });
      }
    },
  });
}

export default registerRoutes;
