// src/lib/format.ts
// File Summary:
// This file provides utility functions for formatting values, currently focusing on currency formatting.
// It ensures consistent display of currency values across the application and includes a fallback for invalid input.
// Key responsibilities:
// - Formats numbers into localized currency strings using Intl.NumberFormat.
// - Handles null/undefined amounts gracefully by returning an empty string.
// - Provides a fallback for invalid currency codes, appending the raw value with the currency string.
//
// Dependencies:
// - Built-in Intl.NumberFormat API: handles locale-aware number/currency formatting.
//
// Folder structure notes:
// - This file lives in `src/lib/`, which contains small reusable helpers and utilities shared across the app.
// - Centralizing utilities in `lib` ensures consistency and avoids duplicated logic.
//
// Typical usage:
// - Used in RevenueTable and MonthSummaryTable to ensure consistent currency formatting.
// - Can be reused by any component displaying monetary values.

export function formatCurrency(amount: number | null | undefined, currency: string = 'USD') {
  if (amount == null) return '';
  try {
    // Format number as a currency string in the given currency (default: USD)
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    // Fallback: if the currency code is invalid, return a plain string with value + currency
    return `${amount.toFixed(2)} ${currency}`;
  }
}
