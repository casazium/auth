process.env.DB_FILE = `./test.${process.pid}.db`; // ✅ unique per test worker

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import magicLinkRoutes from '../src/routes/magicLink.js';

const buildApp = () => {
  const app = Fastify({ logger: false });
  app.register(magicLinkRoutes);
  return app;
};

describe('POST /magic-link', () => {
  let app;

  beforeAll(async () => {
    console.log('Loading schema from: ./src/db/schema.sql');
    const schema = fs.readFileSync('./src/db/schema.sql', 'utf-8');
    console.log('Loaded schema:\n', schema);

    await new Promise((res, rej) => {
      const db = new sqlite3.Database(process.env.DB_FILE);
      db.exec(schema, (err) => {
        if (err) {
          console.error('❌ Schema execution failed:', err);
          return rej(err);
        }
        db.close();
        res();
      });
    });

    // 🔍 Verify table existence
    const verifyDb = new sqlite3.Database(process.env.DB_FILE);
    verifyDb.all(
      "SELECT name FROM sqlite_master WHERE type='table'",
      (err, rows) => {
        if (err) {
          console.error('❌ Failed to verify tables:', err);
        } else {
          console.log(
            '✅ Tables present in test DB:',
            rows.map((r) => r.name)
          );
        }
        verifyDb.close();
      }
    );

    // Create test user
    await new Promise((res, rej) => {
      const db = new sqlite3.Database(process.env.DB_FILE);
      db.run(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        ['magic@test.com', 'hashedpassword'],
        (err) => {
          if (err) return rej(err);
          db.close();
          res();
        }
      );
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

  it('should return 200 when email is valid and user exists', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/magic-link',
      payload: { email: 'magic@test.com' },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
  });

  it('should return 200 even if user does not exist', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/magic-link',
      payload: { email: 'notfound@example.com' },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(true);
  });

  it('should return 400 if email is missing', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/magic-link',
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
    expect(body.message).toBe('Email is required');
  });
});
