import express, { type ErrorRequestHandler } from 'express';
import { publicQuotesRouter } from './routes/publicQuotes.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/public/quotes', publicQuotesRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: 'not_found' });
  });

  // Último middleware: erros inesperados viram 500 sem vazar detalhes
  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  };
  app.use(onError);

  return app;
}
