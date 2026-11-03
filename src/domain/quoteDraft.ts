import type { QuoteItem, Service, Unit } from '../db';

/* ------------------------------------------------------------------ *
 * Tipos
 * ------------------------------------------------------------------ */

/** Item do rascunho com uid efêmero para uso como key na interface. */
export type DraftItem = QuoteItem & { uid: string };

export interface DraftState {
  items: DraftItem[];
}

/* ------------------------------------------------------------------ *
 * Ações
 * ------------------------------------------------------------------ */

export type DraftAction =
  | { type: 'addService'; service: Pick<Service, 'name' | 'unitPriceCents' | 'unit'> }
  | { type: 'setQuantity'; uid: string; quantity: number }
  | { type: 'removeItem'; uid: string }
  | { type: 'reset' };

/* ------------------------------------------------------------------ *
 * Estado inicial
 * ------------------------------------------------------------------ */

export const initialDraftState: DraftState = { items: [] };

/* ------------------------------------------------------------------ *
 * Reducer PURO — sem efeitos colaterais, sem setState externo.
 * ------------------------------------------------------------------ */

export function quoteDraftReducer(
  state: DraftState,
  action: DraftAction,
): DraftState {
  switch (action.type) {
    case 'addService': {
      const { name, unitPriceCents, unit } = action.service;

      // Se já existir item com mesmo nome, preço e unidade, soma 1 na quantidade
      const existingIdx = state.items.findIndex(
        (i) =>
          i.name === name &&
          i.unitPriceCents === unitPriceCents &&
          i.unit === unit,
      );

      if (existingIdx >= 0) {
        const items = state.items.map((item, idx) =>
          idx === existingIdx
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
        return { ...state, items };
      }

      // Senão, cria item novo com uid
      const newItem: DraftItem = {
        uid: crypto.randomUUID(),
        name,
        unitPriceCents,
        unit,
        quantity: 1,
      };
      return { ...state, items: [...state.items, newItem] };
    }

    case 'setQuantity': {
      const items = state.items.map((item) =>
        item.uid === action.uid
          ? { ...item, quantity: action.quantity }
          : item,
      );
      return { ...state, items };
    }

    case 'removeItem': {
      const items = state.items.filter((item) => item.uid !== action.uid);
      return { ...state, items };
    }

    case 'reset':
      return initialDraftState;
  }
}

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

/** Remove o uid efêmero dos itens, retornando QuoteItem[] pronto para salvar. */
export function toQuoteItems(draft: DraftState): QuoteItem[] {
  return draft.items.map(({ name, quantity, unitPriceCents, unit }) => ({
    name,
    quantity,
    unitPriceCents,
    unit,
  }));
}

/** Tipo auxiliar para criar itens com unidade específica nos testes */
export type { Unit };

