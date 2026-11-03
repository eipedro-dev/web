import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Service, type Quote } from '../db';

/**
 * Retorna todos os serviços ativos (deleted !== 1), ordenados por nome em pt-BR.
 * Leitura reativa via useLiveQuery — atualiza automaticamente quando o banco muda.
 */
export function useServices(): Service[] | undefined {
  return useLiveQuery(async () => {
    const list = await db.services.filter((s) => s.deleted !== 1).toArray();
    return list.sort((a, b) =>
      a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }),
    );
  }, []);
}

/**
 * Retorna todos os orçamentos ativos (deleted !== 1), do mais recente ao mais antigo.
 * Leitura reativa via useLiveQuery — atualiza automaticamente quando o banco muda.
 */
export function useQuotes(): Quote[] | undefined {
  return useLiveQuery(async () => {
    const list = await db.quotes.filter((q) => q.deleted !== 1).toArray();
    return list.sort((a, b) => b.createdAt - a.createdAt);
  }, []);
}


/**
 * Quantos registros (orçamentos + serviços) têm alteração ainda não enviada.
 * Usa o índice `dirty`, então não varre as tabelas inteiras.
 */
export function usePendingCount(): number | undefined {
  return useLiveQuery(async () => {
    const [quotes, services] = await Promise.all([
      db.quotes.where('dirty').equals(1).count(),
      db.services.where('dirty').equals(1).count(),
    ]);
    return quotes + services;
  }, []);
}