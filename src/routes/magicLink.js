import { createMagicLink } from '../services/magicLinkService.js';

async function magicLinkRoutes(fastify, options) {
  fastify.post('/magic-link', {
    schema: {
      summary: 'Request a magic link',
      description: "Sends a one-time-use token to the user's email",
      tags: ['Auth'],
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
      response: {
        200: { $ref: 'SuccessResponse#' },
        400: { $ref: 'ErrorResponse#' },
        500: { $ref: 'ErrorResponse#' },
      },
    },
    handler: async (request, reply) => {
      const { email } = request.body;

      try {
        const result = await createMagicLink(email);
        return reply.status(200).send(result);
      } catch (err) {
        fastify.log.error('🔥 Magic link route failed:', err);
        return reply
          .status(500)
          .send({ success: false, message: 'Internal server error' });
      }
    },
  });
}

export default magicLinkRoutes;
