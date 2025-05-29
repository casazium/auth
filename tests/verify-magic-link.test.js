import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import { buildApp } from '../src/app.js';

const dbFile = process.env.DB_FILE;

describe('POST /verify-magic-link', () => {
  let app;
  let validToken;
  let expiredToken;

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
        ['verify@test.com'],
        function (err) {
          if (err) return rej(err);
          res(this.lastID);
        }
      );
    });

    const now = Date.now();
    validToken = 'validtoken123';
    expiredToken = 'expiredtoken123';

    await Promise.all([
      new Promise((res, rej) => {
        db.run(
          'INSERT INTO magic_links (token, user_id, expires_at) VALUES (?, ?, ?)',
          [validToken, userId, new Date(now + 60000).toISOString()],
          (err) => (err ? rej(err) : res())
        );
      }),
      new Promise((res, rej) => {
        db.run(
          'INSERT INTO magic_links (token, user_id, expires_at) VALUES (?, ?, ?)',
          [expiredToken, userId, new Date(now - 60000).toISOString()],
          (err) => (err ? rej(err) : res())
        );
      }),
    ]);

    db.close();
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    if (app) await app.close();
    fs.unlinkSync(dbFile);
  });

  it('should return 200 and a token for a valid magic link', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/verify-magic-link',
      payload: { token: validToken },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(true);
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
  });

  it('should return 400 if token is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/verify-magic-link',
      payload: {},
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/must have required property 'token'/);
  });

  it('should return 401 if token is invalid', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/verify-magic-link',
      payload: { token: 'invalidtoken' },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/invalid or expired/i);
  });

  it('should return 401 if token is expired', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/verify-magic-link',
      payload: { token: expiredToken },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body.success).toBe(false);
    expect(body.message).toMatch(/token has expired/i);
  });
});
