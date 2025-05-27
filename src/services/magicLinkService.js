import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { randomBytes } from 'crypto';

function getDb() {
  const dbPath = process.env.DB_FILE || './casazium.db';
  console.log('🧪 Opening DB:', dbPath);
  return new sqlite3.Database(dbPath);
}

export async function createMagicLink(email) {
  const db = getDb();
  const getAsync = promisify(db.get.bind(db));
  const runAsync = promisify(db.run.bind(db));

  try {
    const user = await getAsync('SELECT id FROM users WHERE email = ?', [
      email,
    ]);

    if (!user) {
      // Don't reveal whether the user exists
      return { success: true };
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins from now

    await runAsync(
      'INSERT INTO magic_links (token, user_id, expires_at) VALUES (?, ?, ?)',
      [token, user.id, expiresAt]
    );

    const magicLink = `https://your-app.com/verify?token=${token}`;
    console.log(`📧 Magic link for ${email}: ${magicLink}`);

    return { success: true };
  } catch (err) {
    console.error('🔥 Error creating magic link:', err);
    throw err;
  } finally {
    db.close();
  }
}
