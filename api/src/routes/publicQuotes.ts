import { Router } from 'express';
import { z } from 'zod';
import type { RowDataPacket } from 'mysql2';
import { pool, parseJson } from '../lib/db.js';

// O token é o único "segredo" do link. Rejeitamos qualquer formato diferente
// antes de chegar ao banco.
const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{6,16}$/);

export interface PublicQuoteItem {
  name: string;
  quantity: number;
  unitPriceCents: number;
  unit: string;
}

export const publicQuotesRouter = Router();

// GET /public/quotes/:token  (sem login)
publicQuotesRouter.get('/:token', async (req, res) => {
  const token = tokenSchema.safeParse(req.params.token);
  if (!token.success) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT client_name, items, discount_cents, notes, updated_at
       FROM quotes
      WHERE public_token = ? AND deleted_at IS NULL
      LIMIT 1`,
    [token.data],
  );

  const row = rows[0];
  if (!row) {
    res.status(404).json({ error: 'not_found' });
    return;
  }

  // Resposta pública: só o necessário. Nunca user_id, id interno ou versão.
  res.json({
    clientName: row.client_name,
    items: parseJson<PublicQuoteItem[]>(row.items),
    discountCents: row.discount_cents,
    notes: row.notes,
    updatedAt: row.updated_at,
  });
});
