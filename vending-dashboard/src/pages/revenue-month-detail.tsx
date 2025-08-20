// src/pages/revenue-month-detail.tsx
// File Summary:
// The RevenueMonthDetail page displays machine-level revenue details for a selected month.
// It queries the Supabase view `monthly_revenue`, filters by year/month (and optionally currency),
// and renders a ranked list of machines by total revenue for that period.
//
// Key responsibilities:
// - Parse year/month params from the route and build a YYYY-MM-01 filter date.
// - Fetch machine-level revenue for that month from Supabase, sorted by revenue descending.
// - Respect a preferred currency passed via navigation state and enforce filtering if provided.
// - Display results in a table with machine, location, revenue, and transaction count.
// - Provide navigation back to the revenue overview via breadcrumbs.
// - Handle loading, error, and empty states gracefully.
//
// Dependencies:
// - supabase-js: queries the `monthly_revenue` view.
// - react-router-dom: routing, params, navigation, and breadcrumbs.
// - shadcn/ui: Breadcrumb components for navigation context.
// - Intl.NumberFormat: for localized currency formatting.
//
// Folder structure notes:
// - Located in `src/pages/`, this file represents the route `/revenue/:year/:month`.
// - It complements the main revenue overview page by drilling down into machine-level detail.
//
// Security notes:
// - Supabase RLS must permit:
//   • View `monthly_revenue`: SELECT for authenticated users (read-only).  
// - Clients can only read aggregated values; inserts/updates are restricted at the database level.

import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

type Row = {
  month: string;
  machine_id: string;
  machine_name: string;
  machine_location: string | null;
  currency: string;
  total_revenue: number;
  transactions_count: number;
};

export default function RevenueMonthDetail() {
  const { year, month } = useParams(); // URL params: year + month
  const { state } = useLocation() as { state?: { currency?: string } };
  const navigate = useNavigate();

  const preferredCurrency = state?.currency;

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build YYYY-MM-01 string to filter Supabase view
  const monthStart = useMemo(() => `${year}-${month}-01`, [year, month]);

  // Human-friendly month label (e.g., "March 2025")
  const monthLabel = useMemo(() => {
    try {
      const d = new Date(Number(year), Number(month) - 1, 1);
      return d.toLocaleString("en-US", { month: "long", year: "numeric" });
    } catch {
      return `${year}-${month}`;
    }
  }, [year, month]);

  // Fetch machine-level revenue for the month
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      const q = supabase
        .from("monthly_revenue")
        .select(
          "month,machine_id,machine_name,machine_location,currency,total_revenue,transactions_count"
        )
        .eq("month", monthStart)
        .order("total_revenue", { ascending: false });

      // Apply currency filter if passed via navigation state
      if (preferredCurrency) q.eq("currency", preferredCurrency);

      const { data, error } = await q;
      if (error) {
        setError(error.message ?? "Failed to load month details.");
        setLoading(false);
        return;
      }

      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, [monthStart, preferredCurrency]);

  // Format number as currency with given ISO code
  const fmtCurrency = (value: number, currency: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value ?? 0);

  return (
    <div className="p-6 space-y-4">
      {/* Back button + Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 rounded-md border border-zinc-300 hover:bg-zinc-50 text-sm"
        >
          ← Back
        </button>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/revenue">Revenue</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/revenue?year=${year}`}>{year}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>{monthLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h1 className="text-2xl font-bold">Top Machines — {monthLabel}</h1>

      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}

      {/* Results table */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-md shadow mt-2">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-3">Machine</th>
                <th className="text-left p-3">Location</th>
                <th className="text-left p-3">Revenue</th>
                <th className="text-left p-3">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.machine_id} className="border-t">
                  <td className="p-3">{r.machine_name}</td>
                  <td className="p-3">{r.machine_location ?? "-"}</td>
                  <td className="p-3 font-medium">
                    {fmtCurrency(r.total_revenue, (preferredCurrency ?? r.currency ?? "USD"))}
                  </td>
                  <td className="p-3">{r.transactions_count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Note when currency is filtered */}
          {!!preferredCurrency && (
            <p className="text-xs text-zinc-500 mt-2">
              Showing values in <span className="font-medium">{preferredCurrency}</span>.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
