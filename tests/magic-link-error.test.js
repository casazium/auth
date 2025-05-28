// tests/magic-link-error.test.js
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify from 'fastify';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { buildApp } from '../src/app.js';
import * as magicService from '../src/services/magicLinkService.js';
import magicLinkRoutes from '../src/routes/magicLink.js';

const dbFile = process.env.DB_FILE;

describe('POST /magic-link (error simulation)', () => {
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

  it('should return 500 if createMagicLink throws', async () => {
    vi.spyOn(magicService, 'createMagicLink').mockImplementation(() => {
      throw new Error('Forced failure');
    });

    const response = await app.inject({
      method: 'POST',
      url: '/magic-link',
      payload: { email: 'fail@test.com' },
    });

    expect(response.statusCode).toBe(500);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
    vi.restoreAllMocks();
  });
});
