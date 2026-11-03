import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

/**
 * Conectividade como DICA, não como verdade: navigator.onLine diz se há uma
 * rede conectada, não se a internet funciona. Quando o motor de sync existir,
 * o resultado real do fetch passa a ter prioridade sobre este valor.
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true, // valor no servidor / antes de hidratar
  );
}