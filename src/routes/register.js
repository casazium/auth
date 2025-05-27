
import bcrypt from 'bcrypt';
import { createUser } from '../services/userService.js';

async function registerRoutes(fastify, options) {
  fastify.post('/register', async (request, reply) => {
    const { email, password } = request.body;

    if (!email) {
      return reply.status(400).send({ success: false, message: 'Email is required' });
    }

    try {
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
      const result = await createUser(email, hashedPassword);

      if (result.success) {
        return reply.status(201).send({ success: true, message: 'User registered' });
      } else {
        return reply.status(409).send({ success: false, message: result.message || 'User already exists' });
      }
    } catch (err) {
      console.error('🔥 Register route error:', err);  // 👈 Key for CI log
      return reply.status(500).send({ success: false, message: 'Internal server error' });
    }
  });
}

export default registerRoutes;
