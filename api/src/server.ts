import { env } from './config.js';
import { createApp } from './app.js';
import { pool } from './lib/db.js';

const server = createApp().listen(env.PORT, () => {
  console.log(`API rodando em http://localhost:${env.PORT}`);
});

// Encerramento limpo (Ctrl+C no terminal ou parada do container)
function shutdown() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
