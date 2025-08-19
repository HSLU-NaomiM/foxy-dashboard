// src/pages/revenue.tsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabaseClient";
import RevenueChart from "@/components/RevenueChart";
import RevenueTable from "@/components/RevenueTable";
import MonthSummaryTable from "@/components/MonthSummaryTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // shadcn
import { aggregateByMonth, fillMissingMonths } from "@/lib/revenue-helpers";

type Row = {
  month: string;
  machine_id: string;
  machine_name: string;
  machine_location: string | null;
  currency: string;
  total_revenue: number;
  transactions_count: number;
};
type MonthRow = {
  month: string;
  currency: string;
  total_revenue: number;
  transactions_count: number;
};

export default function RevenuePage() {
  const { t } = useTranslation();
  const [rows, setRows] = useState<Row[]>([]);
  const [months, setMonths] = useState<MonthRow[]>([]);
  const [machines, setMachines] = useState<{ machine_id: string; machine_name: string }[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string | "all">("all");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError(null);

      const [rev, monthly] = await Promise.all([
        supabase
          .from("monthly_revenue")
          .select("month,machine_id,machine_name,machine_location,currency,total_revenue,transactions_count")
          .order("month", { ascending: true }),
        supabase
          .from("monthly_revenue_by_month")
          .select("month,currency,total_revenue,transactions_count")
          .order("month", { ascending: true }),
      ]);

      if (rev.error || monthly.error) {
        setError(rev.error?.message ?? monthly.error?.message ?? "Failed to load revenue");
        setLoading(false);
        return;
      }

      setRows((rev.data ?? []) as Row[]);
      setMonths((monthly.data ?? []) as MonthRow[]);

      const uniqueMachines = Array.from(
        new Map(((rev.data ?? []) as Row[]).map(r => [r.machine_id, { machine_id: r.machine_id, machine_name: r.machine_name }])).values()
      );
      setMachines(uniqueMachines);

      setLoading(false);
    })();
  }, []);

  const availableYears = useMemo(() => {
    const ys = new Set<number>();
    for (const r of rows) {
      const y = r.month ? new Date(r.month).getFullYear() : 0;
      if (y) ys.add(y);
    }
    return Array.from(ys).sort((a, b) => a - b);
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      const y = r.month ? new Date(r.month).getFullYear() : 0;
      const okY = y === selectedYear;
      const okM = selectedMachine === "all" || r.machine_id === selectedMachine;
      return okY && okM;
    });
  }, [rows, selectedYear, selectedMachine]);

  // Aggregierte Daten für den Chart (ein Balken je Monat)
  const chartData = useMemo(() => {
    const base = aggregateByMonth(
      filteredRows.map(r => ({
        month: r.month, machine_id: r.machine_id, machine_name: r.machine_name,
        currency: r.currency, total_revenue: r.total_revenue
      })),
      selectedMachine,
      selectedYear
    );
    return fillMissingMonths(base, selectedYear).map(x => ({
      month: x.monthISO, total_revenue: x.total, currency: x.currency,
    }));
  }, [filteredRows, selectedMachine, selectedYear]);

  // Monatsübersicht (View) auf das gewählte Jahr filtern
  const monthSummary = useMemo(
    () => months.filter(m => new Date(m.month).getFullYear() === selectedYear),
    [months, selectedYear]
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t("revenuePage.title")}</h1>

      <div className="flex flex-wrap gap-4">
        <select className="border p-2 rounded" value={selectedMachine} onChange={(e) => setSelectedMachine(e.target.value)}>
          <option value="all">{t("revenuePage.selectMachine")}</option>
          {machines.map(m => <option key={m.machine_id} value={m.machine_id}>{m.machine_name}</option>)}
        </select>

        <select className="border p-2 rounded" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
          {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {error && <div className="p-4 text-center text-red-500">{error}</div>}

      {/* Chart uses aggregated data */}
      <RevenueChart data={chartData} />

      {/* Tabs: Month overview vs Machine detail table */}
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">{t("revenuePage.monthlyOverviewTab", "Monthly overview")}</TabsTrigger>
          <TabsTrigger value="machines">{t("revenuePage.machineDetailsTab", "Machine details")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <MonthSummaryTable rows={monthSummary} />
        </TabsContent>

        <TabsContent value="machines">
          <RevenueTable data={filteredRows} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
