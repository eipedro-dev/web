import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePendingCount } from '../data/queries';

/** Indicador do cabeçalho: conectividade real + quantos registros aguardam envio. */
export const ConnectionPill: React.FC = () => {
  const online = useOnlineStatus();
  const pending = usePendingCount() ?? 0;

  return (
    <div
      role="status"
      className={`ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${
        online
          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
          : 'bg-slate-100 text-slate-700 border-slate-300'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-600' : 'bg-slate-500'}`}
        aria-hidden="true"
      />
      {online ? 'Online' : 'Sem internet'}
      {pending > 0 && (
        <span className="font-normal">
          · {pending} {pending === 1 ? 'pendente' : 'pendentes'}
        </span>
      )}
    </div>
  );
};