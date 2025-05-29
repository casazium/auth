import { verifyMagicLink } from '../services/verifyMagicLinkService.js';

async function verifyMagicLinkRoutes(fastify, options) {
  fastify.post('/verify-magic-link', {
    schema: {
      summary: 'Verify a magic link token',
      description:
        'Verifies a token and returns access and refresh tokens if valid',
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string' },
        },
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        400: { $ref: 'ErrorResponse#' },
        401: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const { token } = request.body;

      try {
        const result = await verifyMagicLink(token);

        if (!result.success) {
          const msg = result.message.toLowerCase();
          const status =
            msg.includes('expired') || msg.includes('used') ? 401 : 400;
          return reply.status(status).send({
            success: false,
            message: result.message,
          });
        }

        return reply.status(200).send(result);
      } catch (err) {
        fastify.log.error('🔥 Magic link verification failed:', err);
        return reply.status(500).send({
          success: false,
          message: 'Internal server error',
        });
      }
    },
  });
}

export default verifyMagicLinkRoutes;
