/**
 * Formata um valor em centavos para exibição em reais
 */
export const formatCurrencyInCents = (cents: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};

/**
 * Converte um valor em reais para centavos
 */
export const convertToCents = (value: number): number => {
  return Math.round(value * 100);
};

/**
 * Converte centavos para reais
 */
export const convertFromCents = (cents: number): number => {
  return cents / 100;
};

/**
 * Formata um valor numérico para exibição
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat("pt-BR").format(value);
};

/**
 * Formata uma data para exibição
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("pt-BR").format(date);
};

/**
 * Formata uma data e hora para exibição
 */
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

/**
 * Calcula a diferença percentual entre dois valores
 */
export const calculatePercentageChange = (
  oldValue: number,
  newValue: number,
): number => {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

/**
 * Formata uma porcentagem para exibição
 */
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};
