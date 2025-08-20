// src/lib/revenue-helpers.ts
// File Summary:
// This file provides helper functions for processing and normalizing revenue data.
// It defines a RevenueRow type for input data and includes utilities for aggregating and completing
// monthly revenue records for a given year.
// Key responsibilities:
// - Defines RevenueRow type (shape of a row from the revenue view).
// - Aggregates raw revenue rows by month, with optional filtering by machine and year.
// - Ensures missing months are filled with zero totals, so charts/tables always display 12 months.
// - Normalizes currency display and provides fallback values.
//
// Dependencies:
// - Relies only on built-in JavaScript Date and Map objects.
//
// Folder structure notes:
// - Located in `src/lib/`, which contains shared utilities and helper functions.
// - This file is specific to revenue-related transformations, centralizing all revenue logic
//   to avoid repeating aggregation/filling logic in components.
//
// Typical usage:
// - Used by RevenueChart to guarantee each month is represented visually, even if no revenue exists.
// - Used by RevenueTable to provide complete, normalized month-by-month data for display.

export type RevenueRow = {
  month: string | Date;          // from view
  machine_id: string;
  machine_name: string;
  currency: string;
  total_revenue: number;
};

// aggregateByMonth:
// Aggregates revenue rows into monthly totals for a given year and machine filter.
export function aggregateByMonth(
  rows: RevenueRow[],
  selectedMachine: string | 'all',
  year: number
) {
  const map = new Map<string, { monthISO: string; total: number; currency: string }>();

  for (const r of rows) {
    // Respect selected machine (skip rows if not matching, unless "all" is selected)
    if (selectedMachine !== 'all' && r.machine_id !== selectedMachine) continue;

    const d = typeof r.month === 'string' ? new Date(r.month) : r.month;
    if (!d || isNaN(d.getTime())) continue;
    if (d.getFullYear() !== year) continue;

    // Use YYYY-MM key for aggregation
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    // Either extend existing aggregate or create a new one
    const prev =
      map.get(key) ??
      {
        monthISO: new Date(Date.UTC(d.getFullYear(), d.getMonth(), 1)).toISOString(),
        total: 0,
        currency: r.currency ?? 'USD',
      };

    prev.total += Number(r.total_revenue ?? 0);
    // Note: first currency is kept; handling mixed currencies would require custom logic
    map.set(key, prev);
  }

  // Return sorted monthly aggregates by date
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.monthISO).getTime() - new Date(b.monthISO).getTime()
  );
}

// fillMissingMonths:
// Ensures that all 12 months of a year are represented, filling missing months with 0 totals.
export function fillMissingMonths(
  agg: { monthISO: string; total: number; currency: string }[],
  year: number,
  fallbackCurrency = 'USD'
) {
  const byKey = new Map(agg.map(x => [x.monthISO.slice(0, 7), x]));
  const out: { monthISO: string; total: number; currency: string }[] = [];

  for (let m = 0; m < 12; m++) {
    const iso = new Date(Date.UTC(year, m, 1)).toISOString();
    const key = iso.slice(0, 7);

    // Keep existing aggregate if available, otherwise insert default with 0 revenue
    out.push(
      byKey.get(key) ?? {
        monthISO: iso,
        total: 0,
        currency: agg[0]?.currency ?? fallbackCurrency,
      }
    );
  }
  return out;
}
