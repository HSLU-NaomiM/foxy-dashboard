// src/pages/revenue-month-detail.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

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
  const { year, month } = useParams(); // month "01".."12"
  const { state } = useLocation() as any;
  const preferredCurrency = state?.currency as string | undefined;

  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const monthStart = useMemo(() => `${year}-${month}-01`, [year, month]);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);

      const q = supabase
        .from("monthly_revenue")
        .select("month,machine_id,machine_name,machine_location,currency,total_revenue,transactions_count")
        .eq("month", monthStart)
        .order("total_revenue", { ascending: false });

      // Optional: enforces single currency on the page
      if (preferredCurrency) q.eq("currency", preferredCurrency);

      const { data, error } = await q;
      if (error) { setError(error.message); setLoading(false); return; }

      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, [monthStart, preferredCurrency]);

  const fmt = (v: number, c: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: c }).format(v ?? 0);

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Top Machines – {year}-{month}</h1>

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
                <td className="p-3 font-medium">{fmt(r.total_revenue, preferredCurrency ?? r.currency ?? "USD")}</td>
                <td className="p-3">{r.transactions_count ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
