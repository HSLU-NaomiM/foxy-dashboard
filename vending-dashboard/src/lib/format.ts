// src/lib/format.ts
export function formatCurrency(amount: number | null | undefined, currency: string = 'USD') {
  if (amount == null) return '';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    // Fallback if an invalid currency sneaks in
    return `${amount.toFixed(2)} ${currency}`;
  }
}
