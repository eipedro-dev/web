import React, { useState } from 'react';
import type { DraftItem } from '../domain/quoteDraft';
import { calcTotals } from '../domain/totals';
import { formatBRL, parseQuantity } from '../lib/money';

interface QuoteItemRowProps {
  item: DraftItem;
  onQuantityChange: (uid: string, quantity: number) => void;
  onRemove: (uid: string) => void;
}

export const QuoteItemRow: React.FC<QuoteItemRowProps> = ({
  item,
  onQuantityChange,
  onRemove,
}) => {
  // text === null  -> o campo NÃO está sendo editado: mostra a quantidade real do item.
  // text !== null  -> o usuário está digitando: mostra exatamente o que ele digitou ("2,").
  // Assim o campo nunca fica desatualizado quando o reducer muda a quantidade
  // (ex.: tocar duas vezes no mesmo serviço no catálogo).
  const [text, setText] = useState<string | null>(null);
  const shown = text ?? String(item.quantity).replace('.', ',');

  // Estado derivado: não precisa ser guardado em useState
  const hasError = text !== null && parseQuantity(text) === null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setText(raw);

    const parsed = parseQuantity(raw);
    // Texto inválido: mostra borda de erro e NÃO altera a quantidade
    if (parsed !== null) onQuantityChange(item.uid, parsed);
  };

  // Ao sair do campo, volta a mostrar o último valor válido (o do item)
  const handleBlur = () => setText(null);

  // Subtotal da linha estritamente via calcTotals
  const lineTotal = calcTotals([item]).totalCents;

  return (
    <li className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5">
      {/* Linha superior: Nome e Preço Unitário */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            {item.name}
          </h3>
          <p className="text-xs text-slate-500">
            Unitário: {formatBRL(item.unitPriceCents)} / {item.unit}
          </p>
        </div>

        {/* Botão Remover (mínimo 44px de área de toque) */}
        <button
          type="button"
          onClick={() => onRemove(item.uid)}
          title={`Remover ${item.name}`}
          aria-label={`Remover ${item.name}`}
          className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-red-600 active:text-red-700 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center shrink-0"
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

      {/* Linha inferior: Campo de Quantidade e Subtotal da linha */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/60">
        <div className="flex items-center gap-1.5">
          <label
            htmlFor={`item-qty-${item.uid}`}
            className="text-xs font-semibold text-slate-600"
          >
            Qtd:
          </label>
          <input
            id={`item-qty-${item.uid}`}
            type="text"
            inputMode="decimal"
            value={shown}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-16 min-h-[44px] px-2 text-center text-sm font-semibold rounded-lg border bg-white focus:outline-none focus:ring-2 ${
              hasError
                ? 'border-red-400 focus:ring-red-200 focus:border-red-500'
                : 'border-slate-300 focus:ring-blue-200 focus:border-blue-600'
            }`}
          />
          <span className="text-xs text-slate-500 font-medium">
            {item.unit}
          </span>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Subtotal</span>
          <span className="text-sm font-bold text-slate-800">
            {formatBRL(lineTotal)}
          </span>
        </div>
      </div>
    </li>
  );
};