import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import { buildApp } from '../src/app.js';

const dbFile = process.env.DB_FILE;

describe('POST /verify-magic-link', () => {
  let app;
  let token;

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

    const db = new sqlite3.Database(dbFile);
    const userId = await new Promise((res, rej) => {
      db.run(
        'INSERT INTO users (email) VALUES (?)',
        ['reuse@test.com'],
        function (err) {
          if (err) return rej(err);
          res(this.lastID);
        }
      );
    });

    const now = Date.now();
    token = 'reusabletoken123';
    await new Promise((res, rej) => {
      db.run(
        'INSERT INTO magic_links (token, user_id, expires_at) VALUES (?, ?, ?)',
        [token, userId, new Date(now + 60000).toISOString()],
        (err) => (err ? rej(err) : res())
      );
    });

    db.close();

    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    fs.unlinkSync(dbFile);
  });

  it('should return 200 the first time the token is used', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/verify-magic-link',
      payload: { token },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
  });

  it('should return 401 if the token is reused', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/verify-magic-link',
      payload: { token },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/Token has already been used/i);
  });
});
