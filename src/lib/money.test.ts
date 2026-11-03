import { describe, it, expect } from 'vitest';
import { formatBRL, parseBRLToCents, parseQuantity } from './money';

describe('formatBRL', () => {
  it('formata centavos para reais com duas casas decimais', () => {
    expect(formatBRL(0)).toBe('R$ 0,00');
    expect(formatBRL(50)).toBe('R$ 0,50');
    expect(formatBRL(5000)).toBe('R$ 50,00');
    expect(formatBRL(5050)).toBe('R$ 50,50');
    expect(formatBRL(123450)).toBe('R$ 1.234,50');
    expect(formatBRL(100000)).toBe('R$ 1.000,00');
  });

  it('lida com arredondamento seguro se receber valor fracionário', () => {
    expect(formatBRL(5050.4)).toBe('R$ 50,50');
  });
});

describe('parseBRLToCents', () => {
  it('converte inteiros simples', () => {
    expect(parseBRLToCents('50')).toBe(5000);
    expect(parseBRLToCents('0')).toBe(0);
    expect(parseBRLToCents('1234')).toBe(123400);
  });

  it('converte decimais com vírgula', () => {
    expect(parseBRLToCents('50,5')).toBe(5050);
    expect(parseBRLToCents('50,50')).toBe(5050);
    expect(parseBRLToCents('50,05')).toBe(5005);
    expect(parseBRLToCents('0,5')).toBe(50);
    expect(parseBRLToCents(',50')).toBe(50);
  });

  it('converte formato brasileiro completo com ponto de milhar e vírgula', () => {
    expect(parseBRLToCents('1.234,50')).toBe(123450);
    expect(parseBRLToCents('R$ 1.234,50')).toBe(123450);
    expect(parseBRLToCents('1.000,00')).toBe(100000);
  });

  it('lida com separador de milhar isolado ou ponto decimal', () => {
    expect(parseBRLToCents('1.000')).toBe(100000);
    expect(parseBRLToCents('50.5')).toBe(5050);
  });

  it('retorna 0 para entradas inválidas ou vazias', () => {
    expect(parseBRLToCents('')).toBe(0);
    expect(parseBRLToCents('   ')).toBe(0);
    expect(parseBRLToCents('abc')).toBe(0);
    expect(parseBRLToCents('-50')).toBe(0);
    expect(parseBRLToCents('1,2,3')).toBe(0);
  });

  it('converte formato com vírgula de milhar e ponto decimal (1,234.50)', () => {
    expect(parseBRLToCents('1,234.50')).toBe(123450);
  });

  it('converte múltiplos pontos de milhar (1.000.000)', () => {
    expect(parseBRLToCents('1.000.000')).toBe(100000000);
  });

  it('arredonda terceira casa decimal: 50,555 → 5056', () => {
    expect(parseBRLToCents('50,555')).toBe(5056);
  });
});

describe('parseQuantity', () => {
  it('aceita inteiros simples', () => {
    expect(parseQuantity('2')).toBe(2);
    expect(parseQuantity('10')).toBe(10);
    expect(parseQuantity('100')).toBe(100);
  });

  it('aceita decimais com vírgula', () => {
    expect(parseQuantity('2,5')).toBe(2.5);
    expect(parseQuantity('0,5')).toBe(0.5);
    expect(parseQuantity('1,25')).toBe(1.25);
  });

  it('aceita decimais com ponto', () => {
    expect(parseQuantity('2.5')).toBe(2.5);
    expect(parseQuantity('0.125')).toBe(0.125);
  });

  it('aceita até 3 casas decimais', () => {
    expect(parseQuantity('1,125')).toBe(1.125);
    expect(parseQuantity('0.001')).toBe(0.001);
  });

  it('rejeita mais de 3 casas decimais', () => {
    expect(parseQuantity('1,1234')).toBeNull();
    expect(parseQuantity('1.12345')).toBeNull();
  });

  it('retorna null para vazio', () => {
    expect(parseQuantity('')).toBeNull();
    expect(parseQuantity('   ')).toBeNull();
  });

  it('retorna null para zero', () => {
    expect(parseQuantity('0')).toBeNull();
    expect(parseQuantity('0,0')).toBeNull();
    expect(parseQuantity('0.00')).toBeNull();
  });

  it('retorna null para negativos', () => {
    expect(parseQuantity('-1')).toBeNull();
    expect(parseQuantity('-2,5')).toBeNull();
  });

  it('retorna null para texto misto', () => {
    expect(parseQuantity('2,5abc')).toBeNull();
    expect(parseQuantity('abc')).toBeNull();
    expect(parseQuantity('12a')).toBeNull();
  });

  it('retorna null para notação científica', () => {
    expect(parseQuantity('1e3')).toBeNull();
    expect(parseQuantity('2E+1')).toBeNull();
    expect(parseQuantity('1.5e2')).toBeNull();
  });

  it('retorna null para múltiplos separadores', () => {
    expect(parseQuantity('1,2,3')).toBeNull();
    expect(parseQuantity('1.2.3')).toBeNull();
    expect(parseQuantity('1,2.3')).toBeNull();
  });
});
