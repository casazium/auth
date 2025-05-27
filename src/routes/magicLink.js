
import { createMagicLink } from '../services/magicLinkService.js';

async function magicLinkRoutes(fastify, options) {
  fastify.post('/magic-link', async (request, reply) => {
    const { email } = request.body;

    if (!email) {
      return reply.status(400).send({ success: false, message: 'Email is required' });
    }

    try {
      const result = await createMagicLink(email);
      return reply.status(200).send(result);
    } catch (err) {
      fastify.log.error('🔥 Magic link route failed:', err);
      return reply.status(500).send({ success: false, message: 'Internal server error' });
    }
  });
}

export default magicLinkRoutes;
