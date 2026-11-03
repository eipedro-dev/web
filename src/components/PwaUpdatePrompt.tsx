import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Avisos do Service Worker:
 *  - offlineReady: o app terminou de ser guardado e já abre sem internet
 *  - needRefresh:  existe uma versão nova; o usuário escolhe quando atualizar
 */
export const PwaUpdatePrompt: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!offlineReady && !needRefresh) return null;

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div
      role="status"
      className="fixed top-16 inset-x-0 z-50 px-4 animate-fade-in"
    >
      <div className="max-w-md mx-auto bg-slate-900 text-white rounded-2xl shadow-xl px-4 py-3 flex items-center justify-between gap-3">
        <p className="text-sm">
          {needRefresh
            ? 'Nova versão disponível.'
            : 'Pronto! O app já funciona sem internet.'}
        </p>
        <div className="flex gap-2 shrink-0">
          {needRefresh && (
            <button
              type="button"
              onClick={() => updateServiceWorker(true)}
              className="min-h-[44px] px-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-sm font-semibold"
            >
              Atualizar
            </button>
          )}
          <button
            type="button"
            onClick={close}
            className="min-h-[44px] px-3 rounded-xl text-sm text-slate-300 hover:text-white"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};