// /src/pages/revenue-month-detail.tsx
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
  const { year, month } = useParams(); // month is "01".."12"
  const { state } = useLocation() as { state?: { currency?: string } };
  const navigate = useNavigate();

  const preferredCurrency = state?.currency;

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Build a YYYY-MM-01 string for equality filtering in the view
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

      // If you navigated from a specific currency link, enforce it here
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
                {/* Pass the selected year back to the overview as a query param */}
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

          {/* Optional: small helper line */}
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
