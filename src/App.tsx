import React, { useState } from 'react';
import { ServicesScreen } from './pages/ServicesScreen';
import { NewQuoteScreen } from './pages/NewQuoteScreen';
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt';
import { ConnectionPill } from './components/ConnectionPill';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quote' | 'services'>('quote');

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top App Bar */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
              O$
            </div>
            <div>
              <span className="font-extrabold text-base text-slate-900 tracking-tight leading-none block">
                OrçaFácil
              </span>
              <span className="text-[10px] text-slate-400 font-medium leading-none">
                Orçamentos para Autônomos
              </span>
            </div>
          </div>

          <ConnectionPill />
        </div>
      </header>

      <PwaUpdatePrompt />

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'quote' ? (
          <NewQuoteScreen onNavigateToServices={() => setActiveTab('services')} />
        ) : (
          <ServicesScreen />
        )}
      </main>

      {/* Barra de Abas no Rodapé (mínimo 44px de altura para alvos de toque) */}
      <nav
        aria-label="Navegação Principal"
        className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-40 shadow-lg"
      >
        <div className="max-w-md mx-auto h-full grid grid-cols-2">
          {/* Aba 1: Orçamento */}
          <button
            type="button"
            onClick={() => setActiveTab('quote')}
            className={`min-h-[44px] h-full flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'quote'
                ? 'text-blue-600 font-bold bg-blue-50/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={activeTab === 'quote' ? '2.3' : '1.8'}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-xs">Orçamento</span>
          </button>

          {/* Aba 2: Serviços */}
          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`min-h-[44px] h-full flex flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === 'services'
                ? 'text-blue-600 font-bold bg-blue-50/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={activeTab === 'services' ? '2.3' : '1.8'}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <span className="text-xs">Serviços</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;