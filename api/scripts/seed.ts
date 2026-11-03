import { pool } from '../src/lib/db.js';

// Dados fixos: rodar de novo apenas atualiza (idempotente).
const USER_ID = '00000000-0000-4000-8000-000000000001';
const QUOTE_ID = '00000000-0000-4000-8000-0000000000a1';
const DEMO_TOKEN = 'demo1234abcd';

await pool.query(
  `INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)
   ON DUPLICATE KEY UPDATE email = VALUES(email)`,
  [USER_ID, 'demo@orcafacil.dev', 'seed-sem-senha-real'],
);

const items = [
  { name: 'Instalação de chuveiro', quantity: 1, unitPriceCents: 15000, unit: 'un' },
  { name: 'Mão de obra', quantity: 2.5, unitPriceCents: 6000, unit: 'h' },
];

await pool.query(
  `INSERT INTO quotes (id, user_id, client_name, client_phone, items, discount_cents, notes, public_token)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)
   ON DUPLICATE KEY UPDATE items = VALUES(items), discount_cents = VALUES(discount_cents)`,
  [QUOTE_ID, USER_ID, 'Carlos Eduardo', '(34) 99999-0000', JSON.stringify(items), 1000,
   'Prazo estimado de 2 dias.', DEMO_TOKEN],
);

console.log(`Seed ok. Teste: GET /public/quotes/${DEMO_TOKEN}`);
await pool.end();
