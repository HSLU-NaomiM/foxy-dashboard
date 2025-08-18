import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { VendingMachinesTable } from "@/components/VendingMachinesTable";
import { AlertsTable } from "@/components/AlertsTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MachineWithStatus, AlertWithMachine } from "@/types/database";
import { Icon } from "lucide-react";
import { foxFaceTail } from "@lucide/lab";
import { useTranslation } from "react-i18next";

function parseMachines(data: any[]): MachineWithStatus[] {
  return data.map((m) => ({
    machine_id: m.machine_id ?? null,
    machine_name: m.machine_name ?? null,
    machine_location: m.machine_location ?? null,
    machine_revenue: m.machine_revenue ?? null,
    alert_id: m.alert_id ?? null,
    alert_name: m.alert_name ?? null,
    alert_severity: m.alert_severity ?? null,
    start_time: m.start_time ?? null,
    machine_status: null, // optional
    machine_alert_id: m.machine_alert_id ?? null,
    currency: m.currency ?? null, // ✅ hinzugefügt
  }));
}

function parseAlerts(data: any[]): AlertWithMachine[] {
  return data.map((a) => ({
    alert_id: a.alert_id,
    alert_name: a.alert_name,
    alert_severity: a.alert_severity,
    machine_id: a.machine_id,
    machine_name: a.machine_name,
    start_time: a.start_time,
    machine_alert_id: a.machine_alert_id,
    machine_location: a.machine_location,
    machine_revenue: a.machine_revenue,
  }));
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [machines, setMachines] = useState<MachineWithStatus[]>([]);
  const [alerts, setAlerts] = useState<AlertWithMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [machinesRes, alertsRes] = await Promise.all([
        supabase
          .from("machines_with_latest_alert")
          .select(
            "machine_id,machine_name,machine_location,machine_revenue,currency,machine_alert_id,alert_id,alert_name,alert_severity,start_time"
          )
          .order("machine_name", { ascending: true }),
        supabase
          .from("latest_active_alerts_per_machine")
          .select(
            "machine_alert_id,alert_id,alert_name,alert_severity,machine_id,machine_name,machine_location,machine_revenue,currency,start_time,resolved_time"
          )
          .order("start_time", { ascending: false }),
      ]);

      if (machinesRes.error || alertsRes.error) throw machinesRes.error || alertsRes.error;

      setMachines(parseMachines(machinesRes.data ?? []));
      setAlerts(parseAlerts(alertsRes.data ?? []));
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err?.message ?? "Failed to load data. Check your Supabase setup.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("dashboard-listeners")
      .on("postgres_changes", { event: "*", schema: "public", table: "machine_alerts_log" }, () =>
        fetchData()
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "machines" }, () =>
        fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const machinesForTable = machines.map((m) => ({
    machine_id: m.machine_id ?? "unknown-id",
    machine_name: m.machine_name ?? "Unknown Machine",
    machine_location: m.machine_location ?? "Unknown Location",
    machine_revenue: m.machine_revenue ?? 0,
    currency: m.currency ?? 'USD',
    machine_alert_id: m.machine_alert_id ?? undefined,
    alerts: m.alert_id
      ? {
          alert_id: m.alert_id,
          alert_name: m.alert_name ?? "Unknown",
          alert_severity: (m.alert_severity ?? "ok") as "error" | "warning" | "offline" | "ok",
        }
      : null,
  }));

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100 p-6 md:p-10 font-inter">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Icon iconNode={foxFaceTail} className="w-10 h-10 text-zinc-800 dark:text-zinc-100" />
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-5xl">
              {t('dashboard.title')}
            </h1>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8">
          <Card className="bg-white dark:bg-zinc-1000 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-lg p-2"> 
            <CardHeader>
              <CardTitle className="text-xl font-bold">{t('machineDetails.title')}</CardTitle>
              <CardDescription>
                {t('machineDetails.status')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="p-4 text-center text-gray-500">
                  {t('dashboard.loading', 'Loading...')}
                </div>
              )}

              {error && (
                <div className="p-4 text-center text-red-500">
                  {error}
                </div>
              )}

              {!loading && !error && machinesForTable.length > 0 ? (
                <VendingMachinesTable machines={machinesForTable} />
              ) : (
                !loading && !error && (
                  <div className="p-4 text-center text-gray-500">
                    {t('dashboard.noMachines', 'No machines found.')}
                  </div>
                )
              )}
            </CardContent>

          </Card>

          <Card className="rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">{t('machineDetails.alerts')}</CardTitle>
              <CardDescription>
                {t('dashboard.revenue')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!loading && !error && alerts.length > 0 ? (
                <AlertsTable alerts={alerts} />
              ) : (
                !loading &&
                !error && (
                  <div className="p-4 text-center text-gray-500">{t('dashboard.noAlerts', 'No active alerts.')}</div>
                )
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}