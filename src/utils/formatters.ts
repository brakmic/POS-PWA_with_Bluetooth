export const formatCurrency = (amount: number, locale = 'en-US', currency = 'USD'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDate = (date: Date, locale = 'en-US'): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatSku = (sku: string): string => {
  if (sku.length >= 10) {
    return `${sku.slice(0, 3)}-${sku.slice(3, 6)}-${sku.slice(6)}`;
  }
  return sku;
};
