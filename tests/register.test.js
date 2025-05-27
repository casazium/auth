
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import registerRoutes from '../src/routes/register.js';

process.env.DB_FILE = './test.db';

const buildApp = () => {
  const app = Fastify({ logger: true });
  app.register(registerRoutes);
  return app;
};

describe('POST /register', () => {
  let app;

  beforeAll(async () => {
    console.log('Loading schema from:', './src/db/schema.sql');
    const schema = fs.readFileSync('./src/db/schema.sql', 'utf-8');
    console.log('Loaded schema:\n', schema);

    await new Promise((res, rej) => {
      const db = new sqlite3.Database(process.env.DB_FILE);
      db.exec(schema, (err) => {
        if (err) {
          console.error('❌ Schema execution failed:', err);
          return rej(err);
        }
        console.log('✅ Schema executed successfully');
        db.close();
        res();
      });
    });

    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
    try {
      fs.unlinkSync(process.env.DB_FILE);
    } catch {}
  });

  it('should register a new user', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/register',
      payload: {
        email: `test+${Date.now()}@example.com`,
        password: 'hunter2',
      },
    });

    expect(response.statusCode).toBe(201);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
  });

  it('should return 400 if email is missing', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/register',
      payload: {
        password: 'hunter2',
      },
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Email is required');
  });

  it('should return 409 if user already exists', async () => {
    const email = `dupe+${Date.now()}@example.com`;

    await app.inject({
      method: 'POST',
      url: '/register',
      payload: { email, password: 'abc123' },
    });

    const response = await app.inject({
      method: 'POST',
      url: '/register',
      payload: { email, password: 'abc123' },
    });

    expect(response.statusCode).toBe(409);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
    expect(body.message).toBe('User already exists');
  });
});
