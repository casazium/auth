// tests/register-duplicate.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { buildApp } from '../src/app.js';
import registerRoutes from '../src/routes/register.js';

const dbFile = process.env.DB_FILE;

describe('POST /register (duplicate test)', () => {
  let app;

  beforeAll(async () => {
    const schema = fs.readFileSync('./src/db/schema.sql', 'utf-8');
    await new Promise((res, rej) => {
      const db = new sqlite3.Database(dbFile);
      db.exec(schema, (err) => {
        if (err) return rej(err);
        db.close();
        res();
      });
    });

    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    fs.unlinkSync(dbFile);
  });

  it('should return 409 if user already exists', async () => {
    const email = `dupe-${Date.now()}@test.com`;
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
