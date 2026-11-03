import Dexie, { type EntityTable } from "dexie";

/* ------------------------------------------------------------------ *
 * Regras do modelo:
 *  - dinheiro SEMPRE em centavos inteiros (nunca float)
 *  - id gerado no cliente (UUID), para criar registros sem rede
 *  - campos de sync já existem desde o início: version, dirty, deleted
 *  - dirty/deleted são 0 | 1 (IndexedDB não indexa boolean)
 * ------------------------------------------------------------------ */

export type Unidades = "un" | "h" | "m²" | "dia";

interface SyncFields {
  /** Versão conhecida do servidor. 0 = nunca sincronizado. */
  version: number;
  /** 1 = tem alteração local ainda não enviada. */
  dirty: 0 | 1;
  /** 1 = excluído (soft delete), para o servidor propagar a exclusão. */
  deleted: 0 | 1;
  updatedAt: number;
}

export interface Service extends SyncFields {
  id: string;
  name: string;
  unitPriceCents: number;
  unit: Unidades;
}

export interface QuoteItem {
  name: string;
  quantity: number;
  unitPriceCents: number;
  unit: Unidades;
}

export interface Quote extends SyncFields {
  id: string;
  clientName: string;
  clientPhone: string;
  clienteEmail: string;
  items: QuoteItem[];
  discountCents: number;
  notes: string | null;
  publicToken: string | null;
  createdAt: number;
}


//Banco

export const db = new Dexie('orcamentos') as Dexie & {
  services: EntityTable<Service, 'id'>;
  quotes: EntityTable<Quote, 'id'>;
};

// Índices só no que você consulta. Os demais campos são gravados normalmente.
db.version(1).stores({
  services: 'id, name, dirty, updatedAt',
  quotes: 'id, updatedAt, dirty'
})

/* ------------------------------------------------------------------ *
 * Fábricas (criam objetos novos, ainda não salvos)
 * ------------------------------------------------------------------ */


const syncDefaults = (): SyncFields => ({
  version: 0,
  dirty: 1,
  deleted: 0,
  updatedAt: Date.now(),
});

export function newService(
  data: Pick<Service, 'name' | 'unitPriceCents' | 'unit'>,
): Service {
  return { id: crypto.randomUUID(), ...data, ...syncDefaults() };
}

export function newQuote(clientName = ''): Quote {
  return {
    id: crypto.randomUUID(),
    clientName,
    clientPhone: null,
    items: [],
    discountCents: 0,
    notes: null,
    publicToken: null,
    createdAt: Date.now(),
    ...syncDefaults(),
  };
}

/* ------------------------------------------------------------------ *
 * Escritas locais
 *
 * Toda alteração feita pelo usuário passa por aqui e marca
 * dirty = 1. É isso que a fila de sync vai ler depois.
 * ------------------------------------------------------------------ */

export async function saveService(service: Service) {
  await db.services.put({ ...service, dirty: 1, updatedAt: Date.now() });
}

export async function removeService(id: string) {
  await db.services.update(id, { deleted: 1, dirty: 1, updatedAt: Date.now() });
}

export async function saveQuote(quote: Quote) {
  await db.quotes.put({ ...quote, dirty: 1, updatedAt: Date.now() });
}

export async function removeQuote(id: string) {
  await db.quotes.update(id, { deleted: 1, dirty: 1, updatedAt: Date.now() });
}

/* ------------------------------------------------------------------ *
 * Armazenamento persistente
 *
 * Pede ao navegador para não apagar o IndexedDB sob pressão de espaço.
 * Chame uma vez na inicialização do app.
 * ------------------------------------------------------------------ */

export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  if (await navigator.storage.persisted()) return true;
  return navigator.storage.persist();
}