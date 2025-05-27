
import sqlite3 from 'sqlite3';
import { promisify } from 'util';

function getDb() {
  const dbPath = process.env.DB_FILE || './casazium.db';
  return new sqlite3.Database(dbPath);
}

export async function createUser(email, passwordHash) {
  const db = getDb();
  const runAsync = promisify(db.run.bind(db));

  try {
    await runAsync(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    );
    return { success: true };
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return { success: false, message: 'User already exists' };
    }
    throw err;
  } finally {
    db.close();
  }
}
