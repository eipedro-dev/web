import React from 'react';
import type { Quote } from '../db';
import { calcTotals } from '../domain/totals';
import { formatBRL } from '../lib/money';
import { getSyncStatus } from '../domain/syncStatus';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { SyncBadge } from './Syncbadge';

interface SavedQuotesListProps {
  quotes: Quote[] | undefined;
  onDeleteQuote: (quote: Quote) => void;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const SavedQuotesList: React.FC<SavedQuotesListProps> = ({
  quotes,
  onDeleteQuote,
}) => {
  const online = useOnlineStatus();

  return (
    <section className="pt-4 space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
          Orçamentos Salvos
        </h2>
        {quotes && quotes.length > 0 && (
          <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
            {quotes.length}
          </span>
        )}
      </div>

      {quotes === undefined && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400 text-xs">
          Carregando orçamentos...
        </div>
      )}

      {quotes !== undefined && quotes.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 text-center text-slate-500 text-xs">
          Nenhum orçamento salvo ainda. Preencha o formulário acima para salvar seu primeiro orçamento.
        </div>
      )}

      {quotes && quotes.length > 0 && (
        <ul className="space-y-3">
          {quotes.map((q) => {
            // Total do orçamento salvo estritamente via calcTotals
            const qTotal = calcTotals(q.items, q.discountCents).totalCents;

            return (
              <li
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {q.clientName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(q.createdAt)}
                    </p>
                    <div className="mt-1.5">
                      <SyncBadge status={getSyncStatus({ dirty: q.dirty, online })} />
                    </div>
                  </div>

                  {/* Botão de Excluir Orçamento */}
                  <button
                    type="button"
                    onClick={() => onDeleteQuote(q)}
                    title={`Excluir orçamento de ${q.clientName}`}
                    aria-label={`Excluir orçamento de ${q.clientName}`}
                    className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center shrink-0"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                {q.clientPhone && (
                  <p className="text-xs text-slate-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {q.clientPhone}
                  </p>
                )}

                {/* Resumo dos itens do orçamento */}
                <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-600 space-y-1">
                  <div className="font-semibold text-slate-700">
                    {q.items.length} {q.items.length === 1 ? 'item' : 'itens'}:
                  </div>
                  <div className="text-slate-500 truncate">
                    {q.items
                      .map((i) => `${i.quantity} ${i.unit} ${i.name}`)
                      .join(', ')}
                  </div>
                </div>

                {q.notes && (
                  <p className="text-xs text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                    Obs: {q.notes}
                  </p>
                )}

                {/* Linha de Total */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Valor Total
                  </span>
                  <span className="text-base font-extrabold text-blue-600">
                    {formatBRL(qTotal)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};