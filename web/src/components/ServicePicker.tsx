import React from 'react';
import type { Service } from '../db';
import { formatBRL } from '../lib/money';

interface ServicePickerProps {
  services: Service[] | undefined;
  onAddService: (service: Service) => void;
  onNavigateToServices?: () => void;
}

export const ServicePicker: React.FC<ServicePickerProps> = ({
  services,
  onAddService,
  onNavigateToServices,
}) => {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
            Serviços Disponíveis
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Toque em um serviço para adicioná-lo ao orçamento.
          </p>
        </div>
      </div>

      {/* Se o catálogo estiver vazio */}
      {services !== undefined && services.length === 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-center">
          <p className="text-xs font-medium text-amber-900 mb-2.5">
            Você ainda não tem serviços cadastrados no catálogo.
          </p>
          {onNavigateToServices && (
            <button
              type="button"
              onClick={onNavigateToServices}
              className="min-h-[44px] px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Ir para Catálogo de Serviços
            </button>
          )}
        </div>
      )}

      {/* Lista em formato de botões de toque */}
      {services && services.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {services.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onAddService(s)}
              className="min-h-[44px] p-3 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-300 active:bg-blue-100 transition-all flex items-center justify-between gap-2 group"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-blue-700">
                  {s.name}
                </p>
                <p className="text-xs text-slate-500">
                  <span className="font-bold text-slate-700">
                    {formatBRL(s.unitPriceCents)}
                  </span>{' '}
                  / {s.unit}
                </p>
              </div>
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

