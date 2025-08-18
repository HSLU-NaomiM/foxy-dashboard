// /src/lib/revenue-helpers.ts
export type RevenueRow = {
  month: string | Date;          // from view
  machine_id: string;
  machine_name: string;
  currency: string;
  total_revenue: number;
};

export function aggregateByMonth(
  rows: RevenueRow[],
  selectedMachine: string | 'all',
  year: number
) {
  const map = new Map<string, { monthISO: string; total: number; currency: string }>();

  for (const r of rows) {
    // respect selected machine (for 'all' keep all)
    if (selectedMachine !== 'all' && r.machine_id !== selectedMachine) continue;

    const d = typeof r.month === 'string' ? new Date(r.month) : r.month;
    if (!d || isNaN(d.getTime())) continue;
    if (d.getFullYear() !== year) continue;

    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const prev = map.get(key) ?? { monthISO: new Date(Date.UTC(d.getFullYear(), d.getMonth(), 1)).toISOString(), total: 0, currency: r.currency ?? 'USD' };
    prev.total += Number(r.total_revenue ?? 0);
    // keep first currency; if you expect mixed currencies, handle it here
    map.set(key, prev);
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.monthISO).getTime() - new Date(b.monthISO).getTime()
  );
}

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
    out.push(byKey.get(key) ?? { monthISO: iso, total: 0, currency: agg[0]?.currency ?? fallbackCurrency });
  }
  return out;
}
