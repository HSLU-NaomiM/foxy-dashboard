// src/components/MonthSummaryTable.tsx
// File Summary:
// Table for displaying monthly revenue summaries.
// Each row links to a detailed revenue page (`/revenue/:year/:month`).
//
// Key responsibilities:
// - Format revenue with Intl.NumberFormat based on currency.
// - Render month/year labels using date-fns.
// - Provide navigation links with currency in route state.
// - Handle empty state gracefully.
//
// Dependencies:
// - date-fns: for month/year formatting.
// - react-router-dom: for navigation links.
// - Tailwind CSS: table layout and styling.

import { format } from "date-fns";
import { Link } from "react-router-dom";

type Row = {
  month: string | Date;
  currency: string;
  total_revenue: number;
  transactions_count: number;
};

export default function MonthSummaryTable({ rows }: { rows: Row[] }) {
  // Format revenue as localized currency
  const fmt = (v: number, c: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: c }).format(v ?? 0);

  if (!rows.length) return <p>No data</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border rounded-md shadow mt-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-3">Month</th>
            <th className="text-left p-3">Revenue</th>
            <th className="text-left p-3">Transactions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const d = typeof r.month === "string" ? new Date(r.month) : r.month;
            const year = d.getFullYear();
            const monthIdx = d.getMonth() + 1;
            const monthParam = String(monthIdx).padStart(2, "0");

            return (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  <Link
                    className="text-sky-700 hover:underline"
                    to={`/revenue/${year}/${monthParam}`}
                    state={{ currency: r.currency }}
                  >
                    {format(d, "MMMM yyyy")} {r.currency ? `(${r.currency})` : ""}
                  </Link>
                </td>
                <td className="p-3 font-medium">
                  {fmt(r.total_revenue, r.currency ?? "USD")}
                </td>
                <td className="p-3">{r.transactions_count ?? 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
