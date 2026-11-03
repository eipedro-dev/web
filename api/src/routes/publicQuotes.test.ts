import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { pool } from '../lib/db.js';

// Estes testes usam o MySQL real (docker compose up -d db + npm run db:migrate).
// Cada execução cria o próprio usuário e apaga tudo no final.
const USER_ID = '00000000-0000-4000-8000-000000000099';
const TOKEN_OK = 'testtok00001';
const TOKEN_DELETED = 'testtok00002';

const items = [
  { name: 'Instalação de chuveiro', quantity: 1, unitPriceCents: 15000, unit: 'un' },
  { name: 'Mão de obra', quantity: 2.5, unitPriceCents: 6000, unit: 'h' },
];

const app = createApp();

beforeAll(async () => {
  await pool.query('DELETE FROM users WHERE id = ?', [USER_ID]);
  await pool.query('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)', [
    USER_ID,
    'teste-publico@orcafacil.dev',
    'x',
  ]);
  await pool.query(
    `INSERT INTO quotes (id, user_id, client_name, items, discount_cents, notes, public_token)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['00000000-0000-4000-8000-0000000000b1', USER_ID, 'Cliente Teste', JSON.stringify(items), 1000, 'Obs', TOKEN_OK],
  );
  await pool.query(
    `INSERT INTO quotes (id, user_id, client_name, items, public_token, deleted_at)
     VALUES (?, ?, ?, ?, ?, NOW(3))`,
    ['00000000-0000-4000-8000-0000000000b2', USER_ID, 'Excluído', JSON.stringify(items), TOKEN_DELETED],
  );
});

afterAll(async () => {
  await pool.query('DELETE FROM users WHERE id = ?', [USER_ID]); // apaga os orçamentos em cascata
  await pool.end();
});

describe('GET /public/quotes/:token', () => {
  it('devolve o orçamento com os campos públicos e mais nada', async () => {
    const res = await request(app).get(`/public/quotes/${TOKEN_OK}`);

    expect(res.status).toBe(200);
    expect(Object.keys(res.body).sort()).toEqual(
      ['clientName', 'discountCents', 'items', 'notes', 'updatedAt'],
    );
    expect(res.body.clientName).toBe('Cliente Teste');
    expect(res.body.discountCents).toBe(1000);
    expect(res.body.items).toEqual(items); // quantidade fracionada (2.5) preservada
  });

  it('404 para token que não existe', async () => {
    const res = await request(app).get('/public/quotes/naoexiste123');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'not_found' });
  });

  it('404 para orçamento excluído (exclusão lógica)', async () => {
    const res = await request(app).get(`/public/quotes/${TOKEN_DELETED}`);
    expect(res.status).toBe(404);
  });

  it('404 para token com formato inválido, sem chegar ao banco', async () => {
    const injection = encodeURIComponent("' OR 1=1 --");
    expect((await request(app).get(`/public/quotes/${injection}`)).status).toBe(404);
    expect((await request(app).get('/public/quotes/curto')).status).toBe(404);
    expect((await request(app).get(`/public/quotes/${'a'.repeat(40)}`)).status).toBe(404);
  });
});

describe('rotas gerais', () => {
  it('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('rota desconhecida devolve 404 em JSON', async () => {
    const res = await request(app).get('/nada');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'not_found' });
  });
});
