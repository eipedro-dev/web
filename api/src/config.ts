import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(3333),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Variáveis de ambiente inválidas:', z.flattenError(parsed.error).fieldErrors);
  console.error('Copie .env.example para .env e confira os valores.');
  process.exit(1);
}

export const env = parsed.data;
