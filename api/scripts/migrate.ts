import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2';
import { env } from '../src/config.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'sql');

const conn = await mysql.createConnection({ uri: env.DATABASE_URL, multipleStatements: true });

await conn.query(`
  CREATE TABLE IF NOT EXISTS _migrations (
    name       VARCHAR(255) NOT NULL PRIMARY KEY,
    applied_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
  )`);

const [done] = await conn.query<RowDataPacket[]>('SELECT name FROM _migrations');
const applied = new Set(done.map((r) => r.name as string));

const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
for (const file of files) {
  if (applied.has(file)) {
    console.log(`= ${file} (já aplicada)`);
    continue;
  }
  await conn.query(await fs.readFile(path.join(dir, file), 'utf8'));
  await conn.query('INSERT INTO _migrations (name) VALUES (?)', [file]);
  console.log(`+ ${file}`);
}

await conn.end();
