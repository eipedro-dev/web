import React, { useReducer, useState } from 'react';
import { newQuote, saveQuote, removeQuote, type Quote, type Service } from '../db';
import { useServices, useQuotes } from '../data/queries';
import { quoteDraftReducer, initialDraftState, toQuoteItems } from '../domain/quoteDraft';
import { calcTotals } from '../domain/totals';
import { formatBRL, parseBRLToCents } from '../lib/money';
import { ServicePicker } from '../components/ServicePicker';
import { QuoteItemRow } from '../components/QuoteItemRow';
import { SavedQuotesList } from '../components/SavedQuotesList';

interface NewQuoteScreenProps {
  onNavigateToServices?: () => void;
}

// Classes repetidas em vários campos
const card = 'bg-white rounded-2xl shadow-sm border border-slate-200 p-4';
const label = 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1';
const input =
  'w-full min-h-[44px] px-3.5 py-2.5 text-sm rounded-xl border bg-slate-50/50 transition-colors focus:bg-white focus:outline-none focus:ring-2';
const inputOk = 'border-slate-300 focus:ring-blue-200 focus:border-blue-600';
const inputErr = 'border-red-400 focus:ring-red-200 focus:border-red-500';

export const NewQuoteScreen: React.FC<NewQuoteScreenProps> = ({ onNavigateToServices }) => {
  // Leitura reativa (somente via hooks de src/data/queries.ts)
  const services = useServices();
  const quotes = useQuotes();

  // Rascunho dos itens: reducer puro. Os demais campos são estados simples.
  const [draft, dispatch] = useReducer(quoteDraftReducer, initialDraftState);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [discountInput, setDiscountInput] = useState('');

  const [clientNameError, setClientNameError] = useState<string | null>(null);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Totais vêm exclusivamente de calcTotals
  const { subtotalCents, discountCents: appliedDiscountCents, totalCents } = calcTotals(
    draft.items,
    parseBRLToCents(discountInput),
  );

  const handleAddService = (service: Service) => {
    dispatch({ type: 'addService', service });
    setItemsError(null);
  };

  const handleSaveQuote = async () => {
    const trimmedName = clientName.trim();
    const nameMissing = !trimmedName;
    const noItems = draft.items.length === 0;

    setClientNameError(nameMissing ? 'O nome do cliente é obrigatório.' : null);
    setItemsError(noItems ? 'Adicione pelo menos um serviço ao orçamento.' : null);
    if (nameMissing || noItems) return;

    const quote = newQuote(trimmedName);
    quote.clientPhone = clientPhone.trim() || null;
    quote.notes = notes.trim() || null;
    quote.items = toQuoteItems(draft); // remove o uid efêmero
    quote.discountCents = appliedDiscountCents;
    await saveQuote(quote);

    dispatch({ type: 'reset' });
    setClientName('');
    setClientPhone('');
    setNotes('');
    setDiscountInput('');

    setSuccessNotice('Orçamento salvo com sucesso!');
    setTimeout(() => setSuccessNotice(null), 3500);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteQuote = async (quote: Quote) => {
    if (!window.confirm(`Deseja realmente excluir o orçamento de "${quote.clientName}"?`)) return;
    await removeQuote(quote.id);
  };

  return (
    <div className="max-w-md mx-auto w-full px-4 pt-4 pb-56">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Novo Orçamento</h1>
        <p className="text-sm text-slate-500 mt-1">
          Selecione os serviços, informe os dados do cliente e gere o orçamento.
        </p>
      </header>

      {successNotice && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-sm font-medium shadow-sm animate-fade-in">
          ✓ {successNotice}
        </div>
      )}

      <div className="space-y-4">
        {/* Dados do cliente */}
        <section className={card}>
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
            Dados do Cliente
          </h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="client-name" className={label}>
                Nome do Cliente <span className="text-red-500">*</span>
              </label>
              <input
                id="client-name"
                type="text"
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  if (clientNameError) setClientNameError(null);
                }}
                placeholder="Ex.: Carlos Eduardo"
                className={`${input} ${clientNameError ? inputErr : inputOk}`}
              />
              {clientNameError && (
                <p className="text-xs text-red-600 font-medium mt-1.5">{clientNameError}</p>
              )}
            </div>
            <div>
              <label htmlFor="client-phone" className={label}>
                Telefone <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <input
                id="client-phone"
                type="tel"
                inputMode="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="Ex.: (11) 98765-4321"
                className={`${input} ${inputOk}`}
              />
            </div>
            <div>
              <label htmlFor="quote-notes" className={label}>
                Observações <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea
                id="quote-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex.: Prazo estimado de 2 dias, pagamento 50% no início..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50/50 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
              />
            </div>
          </div>
        </section>

        <ServicePicker
          services={services}
          onAddService={handleAddService}
          onNavigateToServices={onNavigateToServices}
        />

        {/* Itens do orçamento */}
        <section className={card}>
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span>
              Itens do Orçamento
            </h2>
            {draft.items.length > 0 && (
              <span className="text-xs bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                {draft.items.length} {draft.items.length === 1 ? 'item' : 'itens'}
              </span>
            )}
          </div>

          {itemsError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600">
              {itemsError}
            </div>
          )}

          {draft.items.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">
              Nenhum item adicionado. Toque nos serviços acima para incluir no orçamento.
            </div>
          ) : (
            <ul className="space-y-3">
              {draft.items.map((item) => (
                <QuoteItemRow
                  key={item.uid}
                  item={item}
                  onQuantityChange={(uid, quantity) =>
                    dispatch({ type: 'setQuantity', uid, quantity })
                  }
                  onRemove={(uid) => dispatch({ type: 'removeItem', uid })}
                />
              ))}
            </ul>
          )}
        </section>

        {/* Desconto */}
        <section className={card}>
          <label htmlFor="quote-discount" className={label}>
            Desconto (R$) <span className="text-slate-400 font-normal">(opcional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 select-none">
              R$
            </span>
            <input
              id="quote-discount"
              type="text"
              inputMode="decimal"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              placeholder="0,00"
              className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-slate-50/50 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-600"
            />
          </div>
        </section>

        <SavedQuotesList quotes={quotes} onDeleteQuote={handleDeleteQuote} />
      </div>

      {/* Resumo fixo acima da barra de abas */}
      <footer className="fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl px-4 py-3">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 px-1">
            <div>
              <span>Subtotal: </span>
              <span className="font-bold text-slate-800">{formatBRL(subtotalCents)}</span>
            </div>
            {appliedDiscountCents > 0 && (
              <div>
                <span className="text-emerald-700 font-medium">Desc: </span>
                <span className="font-bold text-emerald-700">- {formatBRL(appliedDiscountCents)}</span>
              </div>
            )}
            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider">Total: </span>
              <span className="text-base font-extrabold text-blue-600">{formatBRL(totalCents)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveQuote}
            className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl py-2.5 transition-colors shadow-md"
          >
            Salvar Orçamento
          </button>
        </div>
      </footer>
    </div>
  );
};