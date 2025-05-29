// src/services/verifyMagicLinkService.js
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { sign } from 'jsonwebtoken';

function getDb() {
  const dbPath = process.env.DB_FILE || './casazium.db';
  return new sqlite3.Database(dbPath);
}

export async function verifyMagicLink(token) {
  const db = getDb();
  const getAsync = promisify(db.get.bind(db));
  const runAsync = promisify(db.run.bind(db));

  try {
    const link = await getAsync(
      'SELECT token, user_id, expires_at, used FROM magic_links WHERE token = ?',
      [token]
    );

    if (!link) {
      return { success: false, message: 'Invalid or expired token' };
    }

    if (link.used) {
      return { success: false, message: 'Token has already been used' };
    }

    const now = new Date();
    if (new Date(link.expires_at) < now) {
      return { success: false, message: 'Token has expired' };
    }

    // Mark token as used
    await runAsync('UPDATE magic_links SET used = 1 WHERE token = ?', [token]);

    // Mark token as used
    await runAsync('UPDATE magic_links SET used = 1 WHERE token = ?', [token]);

    // Mark email as verified
    await runAsync('UPDATE users SET email_verified = 1 WHERE id = ?', [
      link.user_id,
    ]);

    const updatedUser = await getAsync(
      'SELECT email_verified FROM users WHERE id = ?',
      [link.user_id]
    );

    const payload = {
      userId: link.user_id,
      emailVerified: !!updatedUser?.email_verified,
    };

    const secret = process.env.JWT_SECRET;
    const accessToken = sign(payload, secret, { expiresIn: '15m' });
    const refreshToken = sign(payload, secret, { expiresIn: '7d' });

    return { success: true, accessToken, refreshToken };
  } catch (err) {
    console.error('🔥 Error verifying magic link:', err);
    throw err;
  } finally {
    db.close();
  }
}
