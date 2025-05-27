// tests/services/userService-error.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { createUser } from '../../src/services/userService.js';

const dbFile = `./test.${process.pid}.db`;
process.env.DB_FILE = dbFile;

describe('createUser error scenarios', () => {
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
  });

  afterAll(() => {
    try {
      fs.unlinkSync(dbFile);
    } catch {}
  });

  it('throws for null email', async () => {
    await expect(createUser(null, 'abc')).rejects.toThrow();
  });

  it('throws for duplicate email not caught by UNIQUE check', async () => {
    const email = `dupe-${Date.now()}@test.com`;
    await createUser(email, 'abc');
    const second = createUser(email, 'abc');
    await expect(second).resolves.toMatchObject({ success: false });
  });
});
