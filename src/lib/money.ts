/**
 * Utilitários para manipulação de moeda brasileira (BRL).
 * Regra: Dinheiro é sempre representado em centavos inteiros (number)
 * no estado e no banco. Nenhum float pode vazar para fora deste arquivo.
 */

export function formatBRL(cents: number): string {
  const safeCents = Number.isFinite(cents) ? Math.round(cents) : 0;
  const isNegative = safeCents < 0;
  const abs = Math.abs(safeCents);
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;

  const reaisFormatted = reais.toLocaleString('pt-BR');
  const centavosFormatted = centavos.toString().padStart(2, '0');

  return `${isNegative ? '-' : ''}R$ ${reaisFormatted},${centavosFormatted}`;
}

export function parseBRLToCents(input: string): number {
  if (typeof input !== 'string') return 0

  let str = input.trim();
  if (!str) return 0;

  //Remove simbolo de moeda e espaços extras
  str = str.replace(/^R\$\s*/i, '').trim(); 

  //Valores negativos não são aceitos
  if (str.startsWith('-')) return 0;

  //apenas dígitos, pontos, vírgulas e espaços são permitidos
   if (!/^[\d\s.,]+$/.test(str)) {
    return 0;
  }

  //Remove espaços internos
  str = str.replace(/\s+/g, '');

  let intPart: string;
  let fracPart: string;

  const hasComma = str.includes(',');
  const hasDot = str.includes('.');


  if (hasComma && hasDot) {
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');
    if (lastComma > lastDot) {
      // Formato brasileiro: 1.234,50
      const parts = str.split(',');
      if (parts.length > 2) return 0;
      intPart = parts[0].replace(/\./g, '');
      fracPart = parts[1];
    } else {
      // Formato com vírgula de milhar: 1,234.50
      const parts = str.split('.');
      if (parts.length > 2) return 0;
      intPart = parts[0].replace(/,/g, '');
      fracPart = parts[1];
    }
  } else if (hasComma) {
    // Apenas vírgula: 50,5 ou 1234,50
    const parts = str.split(',');
    if (parts.length > 2) return 0;
    intPart = parts[0];
    fracPart = parts[1];
  } else if (hasDot) {
    // Apenas ponto: pode ser milhar (1.000) ou decimal (50.5)
    const parts = str.split('.');
    if (parts.length > 2) {
      // Múltiplos pontos: 1.000.000
      intPart = str.replace(/\./g, '');
      fracPart = '';
    } else {
      // Exatamente um ponto
      if (parts[1].length === 3) {
        // Três dígitos após ponto: separador de milhar (ex.: 1.000)
        intPart = parts[0] + parts[1];
        fracPart = '';
      } else {
        // 1 ou 2 dígitos decimais (ex.: 50.5 ou 50.50)
        intPart = parts[0];
        fracPart = parts[1];
      }
    }
  } else {
    // Apenas dígitos inteiros: 50
    intPart = str;
    fracPart = '';
  }

  if (!/^\d*$/.test(intPart) || !/^\d*$/.test(fracPart)) {
    return 0;
  }

  const intCents = intPart ? parseInt(intPart, 10) * 100 : 0;
  if (!Number.isFinite(intCents)) return 0;

  let fracCents = 0;
  if (fracPart.length === 1) {
    fracCents = parseInt(fracPart, 10) * 10;
  } else if (fracPart.length >= 2) {
    fracCents = parseInt(fracPart.slice(0, 2), 10);
    if (fracPart.length > 2 && parseInt(fracPart[2], 10) >= 5) {
      fracCents += 1;
    }
  }

  return intCents + fracCents;
}

/**
 * Converte uma string de quantidade para number.
 * Aceita dígitos com separador decimal opcional (vírgula ou ponto),
 * no máximo 3 casas decimais.
 *
 * Retorna null para: vazio, zero, negativo, texto misto, notação científica.
 * Não usa parseFloat.
 */
export function parseQuantity(input: string): number | null {
  if (typeof input !== 'string') return null;

  const str = input.trim();
  if (!str) return null;

  // Rejeitar notação científica ("1e3", "2E+1") e qualquer caractere
  // que não seja dígito, vírgula ou ponto.
  if (!/^\d+([.,]\d+)?$/.test(str)) return null;

  // Normalizar separador decimal para ponto
  const normalized = str.replace(',', '.');

  // Separar parte inteira e fracionária
  const dotIndex = normalized.indexOf('.');
  let intStr: string;
  let fracStr: string;

  if (dotIndex >= 0) {
    intStr = normalized.slice(0, dotIndex);
    fracStr = normalized.slice(dotIndex + 1);
    // No máximo 3 casas decimais
    if (fracStr.length > 3) return null;
  } else {
    intStr = normalized;
    fracStr = '';
  }

  // Montar o valor manualmente sem parseFloat
  const intVal = intStr ? parseInt(intStr, 10) : 0;
  if (!Number.isFinite(intVal)) return null;

  let fracVal = 0;
  if (fracStr.length > 0) {
    const fracDigits = parseInt(fracStr, 10);
    if (!Number.isFinite(fracDigits)) return null;
    // Dividir pelo fator correto (10, 100 ou 1000)
    const divisor = Math.pow(10, fracStr.length);
    fracVal = fracDigits / divisor;
  }

  const result = intVal + fracVal;

  // Rejeitar zero e negativos
  if (result <= 0) return null;

  return result;
}
