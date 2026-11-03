/**
 * Estado de sincronização de um registro, DERIVADO de fatos simples.
 * Não existe "estado de sync" guardado no banco: guardamos só `dirty`
 * (tem alteração não enviada?) e deduzimos o resto na hora de mostrar.
 *
 *  local   -> alterado e SEM internet: está só neste aparelho
 *  pending -> alterado e COM internet: esperando a sincronização enviar
 *  synced  -> sem alteração pendente: o servidor já tem a versão atual
 */
export type SyncStatus = 'local' | 'pending' | 'synced';

export interface SyncFacts {
  dirty: 0 | 1;
  online: boolean;
}

export function getSyncStatus({ dirty, online }: SyncFacts): SyncStatus {
  if (dirty === 0) return 'synced';
  return online ? 'pending' : 'local';
}