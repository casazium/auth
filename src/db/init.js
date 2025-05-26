
import sqlite3 from 'sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to database
const db = new sqlite3.Database('./casazium.db');

// Read and execute schema SQL
const schemaPath = join(__dirname, 'schema.sql');
const schema = readFileSync(schemaPath, 'utf-8');

db.exec(schema, (err) => {
  if (err) {
    console.error('❌ Error initializing DB:', err);
  } else {
    console.log('✅ Database initialized');
  }
  db.close();
});
