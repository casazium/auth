process.env.DB_FILE = `./test.${process.pid}.db`; // ✅ unique per test worker

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { buildApp } from '../src/app.js';
import magicLinkRoutes from '../src/routes/magicLink.js';

describe('POST /magic-link', () => {
  let app;

  beforeAll(async () => {
    const dbFile = process.env.DB_FILE;
    console.log('🧪 Using DB file:', dbFile);

    const schema = fs.readFileSync('./src/db/schema.sql', 'utf-8');
    console.log('📄 Loaded schema');

    await new Promise((res, rej) => {
      const db = new sqlite3.Database(dbFile);
      db.serialize(() => {
        db.exec(schema, (err) => {
          if (err) {
            console.error('❌ Failed to execute schema:', err);
            db.close();
            return rej(err);
          }

          console.log('✅ Schema applied');

          db.run(
            'INSERT INTO users (email, password_hash) VALUES (?, ?)',
            ['magic@test.com', 'hashedpassword'],
            (err2) => {
              db.close();
              if (err2) {
                console.error('❌ Failed to insert test user:', err2);
                return rej(err2);
              }
              console.log('✅ Inserted test user: magic@test.com');
              res();
            }
          );
        });
      });
    });

    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
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
    // Don't assert body.success because Fastify validation fails before your handler runs
  });
});
