import React from 'react';
import type { SyncStatus } from '../domain/syncStatus';

const CONFIG: Record<SyncStatus, { label: string; box: string; dot: string }> = {
  local: {
    label: 'Salvo no aparelho',
    box: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-500',
  },
  pending: {
    label: 'Aguardando sincronizar',
    box: 'bg-amber-50 text-amber-800 border-amber-300',
    dot: 'bg-amber-500 animate-pulse motion-reduce:animate-none',
  },
  synced: {
    label: 'Sincronizado',
    box: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-600',
  },
};

export const SyncBadge: React.FC<{ status: SyncStatus }> = ({ status }) => {
  const { label, box, dot } = CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${box}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
};