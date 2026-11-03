import { describe, it, expect } from 'vitest';
import { getSyncStatus } from './syncStatus';

describe('getSyncStatus', () => {
  it('alterado e sem internet: salvo só no aparelho', () => {
    expect(getSyncStatus({ dirty: 1, online: false })).toBe('local');
  });

  it('alterado e com internet: aguardando sincronizar', () => {
    expect(getSyncStatus({ dirty: 1, online: true })).toBe('pending');
  });

  it('sem alteração pendente: sincronizado', () => {
    expect(getSyncStatus({ dirty: 0, online: true })).toBe('synced');
  });

  it('sincronizado continua sincronizado mesmo ficando offline', () => {
    expect(getSyncStatus({ dirty: 0, online: false })).toBe('synced');
  });
});