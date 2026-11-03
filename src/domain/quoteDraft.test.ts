import { describe, it, expect } from 'vitest';
import {
  quoteDraftReducer,
  initialDraftState,
  toQuoteItems,
  type DraftState,
  type DraftAction,
} from './quoteDraft';

function dispatch(state: DraftState, ...actions: DraftAction[]): DraftState {
  return actions.reduce(quoteDraftReducer, state);
}

describe('quoteDraftReducer', () => {
  it('addService cria item com uid', () => {
    const next = dispatch(initialDraftState, {
      type: 'addService',
      service: { name: 'Pintura', unitPriceCents: 5000, unit: 'un' },
    });
    expect(next.items).toHaveLength(1);
    expect(next.items[0].name).toBe('Pintura');
    expect(next.items[0].unitPriceCents).toBe(5000);
    expect(next.items[0].unit).toBe('un');
    expect(next.items[0].quantity).toBe(1);
    expect(next.items[0].uid).toBeTruthy();
  });

  it('addService repetido com mesmo nome, preço e unidade soma 1 na quantidade', () => {
    const svc = { name: 'Pintura', unitPriceCents: 5000, unit: 'un' as const };
    const next = dispatch(
      initialDraftState,
      { type: 'addService', service: svc },
      { type: 'addService', service: svc },
      { type: 'addService', service: svc },
    );
    expect(next.items).toHaveLength(1);
    expect(next.items[0].quantity).toBe(3);
  });

  it('serviços com preço diferente não se fundem', () => {
    const next = dispatch(
      initialDraftState,
      {
        type: 'addService',
        service: { name: 'Pintura', unitPriceCents: 5000, unit: 'un' },
      },
      {
        type: 'addService',
        service: { name: 'Pintura', unitPriceCents: 7000, unit: 'un' },
      },
    );
    expect(next.items).toHaveLength(2);
    expect(next.items[0].unitPriceCents).toBe(5000);
    expect(next.items[1].unitPriceCents).toBe(7000);
  });

  it('setQuantity altera só o item do uid', () => {
    const state = dispatch(
      initialDraftState,
      {
        type: 'addService',
        service: { name: 'A', unitPriceCents: 100, unit: 'un' },
      },
      {
        type: 'addService',
        service: { name: 'B', unitPriceCents: 200, unit: 'h' },
      },
    );
    const uidB = state.items[1].uid;
    const next = quoteDraftReducer(state, {
      type: 'setQuantity',
      uid: uidB,
      quantity: 5,
    });
    expect(next.items[0].quantity).toBe(1); // A inalterado
    expect(next.items[1].quantity).toBe(5); // B alterado
  });

  it('removeItem remove só o uid pedido mesmo com itens repetidos', () => {
    // Cria dois itens distintos (preços diferentes) ambos chamados "Pintura"
    const state = dispatch(
      initialDraftState,
      {
        type: 'addService',
        service: { name: 'Pintura', unitPriceCents: 5000, unit: 'un' },
      },
      {
        type: 'addService',
        service: { name: 'Pintura', unitPriceCents: 7000, unit: 'un' },
      },
    );
    expect(state.items).toHaveLength(2);

    const uidToRemove = state.items[0].uid;
    const next = quoteDraftReducer(state, {
      type: 'removeItem',
      uid: uidToRemove,
    });
    expect(next.items).toHaveLength(1);
    expect(next.items[0].unitPriceCents).toBe(7000);
  });

  it('reset esvazia os itens', () => {
    const state = dispatch(
      initialDraftState,
      {
        type: 'addService',
        service: { name: 'A', unitPriceCents: 100, unit: 'un' },
      },
      {
        type: 'addService',
        service: { name: 'B', unitPriceCents: 200, unit: 'h' },
      },
    );
    const next = quoteDraftReducer(state, { type: 'reset' });
    expect(next.items).toHaveLength(0);
  });

  it('toQuoteItems não contém uid', () => {
    const state = dispatch(initialDraftState, {
      type: 'addService',
      service: { name: 'Pintura', unitPriceCents: 5000, unit: 'un' },
    });
    const quoteItems = toQuoteItems(state);
    expect(quoteItems).toHaveLength(1);
    expect(quoteItems[0]).toEqual({
      name: 'Pintura',
      unitPriceCents: 5000,
      unit: 'un',
      quantity: 1,
    });
    expect('uid' in quoteItems[0]).toBe(false);
  });

  it('o reducer não muta o estado anterior', () => {
    const state0 = initialDraftState;
    const state1 = quoteDraftReducer(state0, {
      type: 'addService',
      service: { name: 'X', unitPriceCents: 100, unit: 'un' },
    });
    // state0 continua vazio
    expect(state0.items).toHaveLength(0);
    expect(state1.items).toHaveLength(1);

    // referências são diferentes
    expect(state0).not.toBe(state1);
    expect(state0.items).not.toBe(state1.items);

    // setQuantity não muta
    const state2 = quoteDraftReducer(state1, {
      type: 'setQuantity',
      uid: state1.items[0].uid,
      quantity: 10,
    });
    expect(state1.items[0].quantity).toBe(1);
    expect(state2.items[0].quantity).toBe(10);
    expect(state1.items).not.toBe(state2.items);

    // removeItem não muta
    const state3 = quoteDraftReducer(state2, {
      type: 'removeItem',
      uid: state2.items[0].uid,
    });
    expect(state2.items).toHaveLength(1);
    expect(state3.items).toHaveLength(0);
  });
});

